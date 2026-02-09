import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

// Enable data migration on upgrades
(with migration = Migration.run)
actor {
  // User Profile (using custom role for display, but authorization uses AccessControl roles)
  public type ProfileRole = {
    #manager;
    #assistant;
  };

  public type UserProfile = {
    username : Text;
    avatar : Nat32;
    role : ProfileRole;
  };

  // Task frequency (for recurring tasks)
  public type TaskType = {
    #weekly;
    #monthly;
    #urgent;
  };

  // Task completion record with photo evidence
  public type TaskCompletion = {
    completedBy : Principal;
    comment : ?Text;
    beforePhoto : ?Storage.ExternalBlob;
    afterPhoto : ?Storage.ExternalBlob;
    completedAt : Time.Time;
  };

  public type Task = {
    id : Nat32;
    title : Text;
    taskType : TaskType;
    isCompleted : Bool;
    currentCompletion : ?TaskCompletion;
    lastResetAt : Time.Time;
  };

  // DecisionEntry (legacy/unused but kept for compatibility)
  public type DecisionEntry = {
    id : Nat32;
    createdBy : Principal;
    createdAt : Time.Time;
    lastUpdated : Time.Time;
    timestamp : Time.Time;
    comment : ?Text;
    decision : DecisionType;
    name : Text;
    repeatInterval : RepeatInterval;
    isDone : Bool;
    decisionFiles : ?[Storage.ExternalBlob];
    completionFiles : ?[Storage.ExternalBlob];
    completionComment : ?Text;
    completionTimestamp : ?Time.Time;
  };

  // Supporting types (for legacy compatibility)
  public type RepeatInterval = {
    #daily;
    #weekly;
    #monthly;
  };

  public type DecisionType = {
    #valid;
    #invalid;
    #critical;
  };

  // Actor variables
  let tasks = Map.empty<Nat32, Task>();
  var decisionEntries = List.empty<DecisionEntry>(); // legacy
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextTaskId : Nat32 = 0;

  // Access control
  let accessControlState = AccessControl.initState();

  // Mixins
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Task Management
  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    tasks.values().toArray();
  };

  public shared ({ caller }) func createTask(title : Text, taskType : TaskType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    if (title.size() == 0) {
      Runtime.trap("Invalid task: title cannot be empty");
    };
    let id = nextTaskId;
    nextTaskId += 1;
    let task : Task = {
      id;
      title;
      taskType;
      isCompleted = false;
      currentCompletion = null;
      lastResetAt = Time.now();
    };
    tasks.add(id, task);
  };

  public shared ({ caller }) func completeTask(taskId : Nat32, comment : ?Text, beforePhoto : ?Storage.ExternalBlob, afterPhoto : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        // Task validation
        switch (task.taskType) {
          case (#weekly) {
            if (taskIsObsolete(task.lastResetAt, true)) {
              Runtime.trap("Invalid task: This weekly task is obsolete and must be reset before completion");
            };
          };
          case (#monthly) {
            if (taskIsObsolete(task.lastResetAt, false)) {
              Runtime.trap("Invalid task: This monthly task is obsolete and must be reset before completion");
            };
          };
          case (#urgent) {};
        };
        let completion : TaskCompletion = {
          completedBy = caller;
          comment;
          beforePhoto;
          afterPhoto;
          completedAt = Time.now();
        };
        let completedTask : Task = {
          task with
          isCompleted = true;
          currentCompletion = ?completion;
        };
        tasks.add(taskId, completedTask);
      };
    };
  };

  public shared ({ caller }) func resetTask(taskId : Nat32) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let resetTask : Task = {
          task with
          isCompleted = false;
          currentCompletion = null;
          lastResetAt = Time.now();
        };
        tasks.add(taskId, resetTask);
      };
    };
  };

  // LEGACY: Decision Entries (unused but kept for compatibility)
  public query ({ caller }) func getDecisionEntries() : async [DecisionEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view decision entries");
    };
    decisionEntries.toArray();
  };

  // Auto-reset recurring tasks based on time intervals.
  public shared ({ caller }) func resetRecurringTasksIfNeeded() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can trigger recurring task resets");
    };

    // Daily reset (should never be called, but kept for legacy compatibility)
    updateAndTrackResetTasks(func(task) { task.taskType == #weekly });

    // Weekly reset: every Monday
    if (Time.now() % (7 * 24 * 3600) < 24 * 3600) {
      // First 24h window after 7 days (Monday)
      updateAndTrackResetTasks(func(task) { task.taskType == #weekly });
    };

    // Monthly reset: first Monday of the month
    if (Time.now() % (30 * 24 * 3600) < 24 * 3600) {
      // First 24h window after 30 days
      updateAndTrackResetTasks(func(task) { task.taskType == #monthly });
    };
  };

  // Helper to update and count reset tasks
  func updateAndTrackResetTasks(taskFilter : Task -> Bool) {
    let completedTaskIds = tasks.toArray().filter(func((_, task)) { task.isCompleted and taskFilter(task) });
    for ((id, task) in completedTaskIds.values()) {
      let resetTask : Task = {
        task with
        isCompleted = false;
        currentCompletion = null;
        lastResetAt = Time.now();
      };
      tasks.add(id, resetTask);
    };
  };

  // Helper to check if a task is obsolete due to not being reset.
  func taskIsObsolete(lastResetAt : Time.Time, _isWeekly : Bool) : Bool {
    let currentTime = Time.now();
    let threshold = if (_isWeekly) { 7 * 24 * 3600 } else { 30 * 24 * 3600 }; // in seconds
    (currentTime - lastResetAt) > threshold;
  };

  // Admin-only: Get all user profiles for reporting (managers only)
  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only managers can view all user profiles");
    };
    userProfiles.entries().toArray();
  };

  // Admin-only: Export task data (for CSV generation, managers only)
  public query ({ caller }) func exportTaskData() : async [Task] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only managers can export task data");
    };
    tasks.values().toArray();
  };
};
