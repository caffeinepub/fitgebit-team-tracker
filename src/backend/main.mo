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

// No migration needed for new field addition without type changes.
// Remove with clause and migration module import.

actor {
  // User Profile (using custom role for display, but authorization uses AccessControl roles)
  public type ProfileRole = {
    #manager;
    #assistant;
  };

  public type DentalAvatar = {
    id : Nat32;
    name : Text;
    svg : Text;
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

  let dentalAvatars = Map.empty<Nat32, DentalAvatar>();

  // Access control
  let accessControlState = AccessControl.initState();

  // Mixins
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // Initialize 16 dental avatars.
  public shared ({ caller }) func initializeAvatars() : async () {
    let avatars : [DentalAvatar] = [
      { id = 0; name = "Smiling Tooth"; svg = "<svg>...smiling...</svg>" },
      { id = 1; name = "Winking Tooth"; svg = "<svg>...winking...</svg>" },
      { id = 2; name = "Chubby Tooth"; svg = "<svg>...chubby...</svg>" },
      { id = 3; name = "Nervous Tooth"; svg = "<svg>...nervous...</svg>" },
      { id = 4; name = "Sleepy Tooth"; svg = "<svg>...sleepy...</svg>" },
      { id = 5; name = "Cool Tooth"; svg = "<svg>...cool...</svg>" },
      { id = 6; name = "Blushing Tooth"; svg = "<svg>...blushing...</svg>" },
      { id = 7; name = "Grinning Tooth"; svg = "<svg>...grinning...</svg>" },
      { id = 8; name = "Toothy Smile"; svg = "<svg>...toothy smile...</svg>" },
      { id = 9; name = "Happy Molar"; svg = "<svg>...happy molar...</svg>" },
      { id = 10; name = "Happy Root"; svg = "<svg>...happy root...</svg>" },
      { id = 11; name = "Excited Tooth"; svg = "<svg>...excited...</svg>" },
      { id = 12; name = "Professor Tooth"; svg = "<svg>...professor...</svg>" },
      { id = 13; name = "Party Tooth"; svg = "<svg>...party tooth...</svg>" },
      { id = 14; name = "Star Tooth"; svg = "<svg>...star tooth...</svg>" },
      { id = 15; name = "Sporty Tooth"; svg = "<svg>...sporty tooth...</svg>" },
    ];

    for (avatar in avatars.values()) {
      dentalAvatars.add(avatar.id, avatar);
    };
  };

  // Get all avatars (no pagination).
  public query ({ caller }) func getAllDentalAvatars() : async [DentalAvatar] {
    dentalAvatars.values().toArray();
  };

  // Explicit role selection with secure Manager validation token.
  public shared ({ caller }) func selectRoleManager(_token : Text) : async () {
    if (_token != "ICPmaxi313") {
      Runtime.trap("Invalid token: Please make sure you entered the Manager token correctly");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public shared ({ caller }) func selectRoleAssistant() : async () {
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  // LEGACY: Decision Entries (unused but kept for compatibility)
  public query ({ caller }) func getDecisionEntries() : async [DecisionEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view decision entries");
    };
    decisionEntries.toArray();
  };

  // Task Management.
  public query ({ caller }) func getTasks() : async [Task] {
    validateUserViaCaller(caller);
    tasks.values().toArray();
  };

  public shared ({ caller }) func createTask(title : Text, taskType : TaskType) : async () {
    validateUserViaCaller(caller);

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
    validateUserViaCaller(caller);

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
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

  func validateUserViaCaller(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
  };

  public shared ({ caller }) func resetTask(taskId : Nat32) : async () {
    validateUserViaCaller(caller);
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

  // Helper to update and count reset tasks.
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

  // Helper to check if a task is obsolete due to not being reset
  func taskIsObsolete(lastResetAt : Time.Time, _isWeekly : Bool) : Bool {
    let currentTime = Time.now();
    let threshold = if (_isWeekly) { 7 * 24 * 3600 } else { 30 * 24 * 3600 }; // in seconds
    (currentTime - lastResetAt) > threshold;
  };

  // Admin-only: Get all user profiles for reporting (managers only)
  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    validateAdminViaCaller(caller);
    userProfiles.entries().toArray();
  };

  // Admin-only: Export task data (for CSV generation, managers only)
  public query ({ caller }) func exportTaskData() : async [Task] {
    validateAdminViaCaller(caller);
    tasks.values().toArray();
  };

  func validateAdminViaCaller(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Manager privileges are required for this action");
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    validateUserViaCaller(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    validateUserViaCaller(caller);
    userProfiles.add(caller, profile);
  };

  // Auto-reset recurring tasks based on time intervals.
  public shared ({ caller }) func resetRecurringTasksIfNeeded() : async () {
    validateUserViaCaller(caller);

    // Daily reset (should never be called, but kept for legacy compatibility).
    updateAndTrackResetTasks(func(task) { task.taskType == #weekly });

    // Weekly reset: every Monday
    if (Time.now() % (7 * 24 * 3600) < 24 * 3600) {
      // First 24h window after 7 days (Monday).
      updateAndTrackResetTasks(func(task) { task.taskType == #weekly });
    };

    // Monthly reset: first Monday of the month.
    if (Time.now() % (30 * 24 * 3600) < 24 * 3600) {
      // First 24h window after 30 days.
      updateAndTrackResetTasks(func(task) { task.taskType == #monthly });
    };
  };
};
