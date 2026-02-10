import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import Storage "blob-storage/Storage";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
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
    initials : Text;
    avatar : Nat32;
    profilePhoto : ?Storage.ExternalBlob;
    role : ProfileRole;
  };

  public type OvertimeEntry = {
    id : Nat32;
    date : Time.Time;
    minutes : Int;
    createdBy : Principal;
    approvedBy : ?Principal;
    approved : Bool;
  };

  public type TaskType = {
    #weekly;
    #monthly;
    #urgent;
  };

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
    description : Text;
    taskType : TaskType;
    isCompleted : Bool;
    currentCompletion : ?TaskCompletion;
    lastResetAt : Time.Time;
    nextResetTimestamp : ?Time.Time;
  };

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

  let tasks = Map.empty<Nat32, Task>();
  var decisionEntries = List.empty<DecisionEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let overtimeEntries = Map.empty<Principal, List.List<OvertimeEntry>>();
  var nextTaskId : Nat32 = 0;
  var nextOvertimeId : Nat32 = 0;

  let dentalAvatars = Map.empty<Nat32, DentalAvatar>();
  let defaultDentalAvatars : [DentalAvatar] = [
    {
      id = 0;
      name = "Pastel Brushing Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#e7e5f4'/><ellipse cx='60' cy='70' rx='34' ry='28' fill='#fff'/><ellipse cx='55' cy='72' rx='8' ry='22' fill='#d9e0fa'/><ellipse cx='65' cy='72' rx='8' ry='22' fill='#d9e0fa'/><ellipse cx='66' cy='91' rx='6' ry='4' fill='#b798ff'/><ellipse cx='54' cy='91' rx='6' ry='4' fill='#b798ff'/><rect x='78' y='86' width='30' height='8' fill='#b798ff'/><rect x='106' y='89' width='6' height='18' fill='#b798ff'/><ellipse cx='72' cy='106' rx='5' ry='7' fill='#fff'/><path d='M78 106q5-3 12.5 0' stroke='#b798ff' stroke-width='2' fill='none'/></svg>";
    },
    {
      id = 1;
      name = "Pastel Molar";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#f1f8e9'/><ellipse cx='60' cy='70' rx='30' ry='22' fill='#fff'/><ellipse cx='50' cy='72' rx='6' ry='16' fill='#e0f7fa'/><ellipse cx='70' cy='72' rx='6' ry='16' fill='#e0f7fa'/><ellipse cx='70' cy='90' rx='5' ry='3' fill='#ffd6ad'/><ellipse cx='50' cy='90' rx='5' ry='3' fill='#ffd6ad'/><ellipse cx='80' cy='84' rx='7' ry='6' fill='#ffd6ad'/><ellipse cx='42' cy='84' rx='7' ry='6' fill='#ffd6ad'/><ellipse cx='58' cy='80' rx='16' ry='13' fill='#ffd6ad'/><ellipse cx='72' cy='103' rx='4' ry='5' fill='#fff'/><ellipse cx='48' cy='103' rx='4' ry='5' fill='#fff'/></svg>";
    },
    {
      id = 2;
      name = "Pastel Molar";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#f1f8e9'/><ellipse cx='60' cy='70' rx='30' ry='22' fill='#fff'/><ellipse cx='50' cy='72' rx='6' ry='16' fill='#e0f7fa'/><ellipse cx='70' cy='72' rx='6' ry='16' fill='#e0f7fa'/><ellipse cx='70' cy='90' rx='5' ry='3' fill='#ffd6ad'/><ellipse cx='50' cy='90' rx='5' ry='3' fill='#ffd6ad'/><ellipse cx='80' cy='84' rx='7' ry='6' fill='#ffd6ad'/><ellipse cx='42' cy='84' rx='7' ry='6' fill='#ffd6ad'/><ellipse cx='58' cy='80' rx='16' ry='13' fill='#ffd6ad'/><ellipse cx='72' cy='103' rx='4' ry='5' fill='#fff'/><ellipse cx='48' cy='103' rx='4' ry='5' fill='#fff'/></svg>";
    },
    {
      id = 3;
      name = "Pastel Root";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#fffbed'/><ellipse cx='60' cy='76' rx='28' ry='18' fill='#fff'/><ellipse cx='62' cy='81' rx='7' ry='18' fill='#f7ffe0'/><ellipse cx='58' cy='81' rx='7' ry='18' fill='#f7ffe0'/><ellipse cx='58' cy='104' rx='6' ry='3' fill='#a2e4d7'/><ellipse cx='62' cy='104' rx='6' ry='3' fill='#a2e4d7'/><ellipse cx='65' cy='98' rx='3.5' ry='4' fill='#a2e4d7'/><ellipse cx='54' cy='98' rx='3.5' ry='4' fill='#a2e4d7'/><ellipse cx='60' cy='92' rx='8' ry='4' fill='#a2e4d7'/></svg>";
    },
    {
      id = 4;
      name = "Pastel Toothy";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#e7e5f4'/><ellipse cx='60' cy='70' rx='34' ry='28' fill='#fff'/><ellipse cx='55' cy='72' rx='8' ry='22' fill='#d9e0fa'/><ellipse cx='65' cy='72' rx='8' ry='22' fill='#d9e0fa'/><ellipse cx='66' cy='91' rx='6' ry='4' fill='#b798ff'/><ellipse cx='54' cy='91' rx='6' ry='4' fill='#b798ff'/><rect x='78' y='86' width='30' height='8' fill='#b798ff'/><rect x='106' y='89' width='6' height='18' fill='#b798ff'/><ellipse cx='72' cy='106' rx='5' ry='7' fill='#fff'/><path d='M78 106q5-3 12.5 0' stroke='#b798ff' stroke-width='2' fill='none'/></svg>";
    },
    {
      id = 5;
      name = "Pastel Floss";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#e5f5f3'/><ellipse cx='60' cy='72' rx='32' ry='24' fill='#fff'/><ellipse cx='55' cy='75' rx='7' ry='19' fill='#d1e4ff'/><ellipse cx='65' cy='75' rx='7' ry='19' fill='#d1e4ff'/><circle cx='60' cy='82' r='16' fill='#16e8b4'/><rect x='40' y='56' width='40' height='12' fill='#16e8b4'/><rect x='53' y='42' width='14' height='14' rx='6' fill='#fff'/><circle cx='60' cy='49' r='2.5' fill='#c99bb8'/></svg>";
    },
    {
      id = 6;
      name = "Pastel Chomper";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#fff8f2'/><ellipse cx='60' cy='72' rx='32' ry='22' fill='#fff'/><ellipse cx='55' cy='75' rx='7' ry='18' fill='#dbbae4'/><ellipse cx='65' cy='75' rx='7' ry='18' fill='#bfd3e1'/><polygon points='60,52.5 90,64 30,64' fill='#efd6bb'/><ellipse cx='50' cy='48' rx='5' ry='6' fill='#efd6bb'/><ellipse cx='70' cy='48' rx='5' ry='6' fill='#efd6bb'/><ellipse cx='61.5' cy='45' rx='6.5' ry='8' fill='#efd6bb'/><ellipse cx='60' cy='79' rx='16' ry='6' fill='#efd6bb'/><ellipse cx='75' cy='62' rx='7' ry='3' fill='#efd6bb'/><ellipse cx='45' cy='62' rx='7' ry='3' fill='#efd6bb'/></svg>";
    },
    {
      id = 7;
      name = "Pastel Whale Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#eeddff'/><ellipse cx='60' cy='76' rx='28' ry='20' fill='#fff'/><ellipse cx='62' cy='81' rx='7' ry='17' fill='#f5efff'/><ellipse cx='58' cy='81' rx='7' ry='17' fill='#f5efff'/><ellipse cx='67' cy='94' rx='7' ry='4' fill='#a2d2e4'/><ellipse cx='53' cy='94' rx='7' ry='4' fill='#a2d2e4'/><ellipse cx='70' cy='88' rx='6' ry='5' fill='#a2d2e4'/><ellipse cx='50' cy='88' rx='6' ry='5' fill='#a2d2e4'/></svg>";
    },
    {
      id = 8;
      name = "Pastel Friendly Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#e7e5f4'/><ellipse cx='60' cy='70' rx='31' ry='22' fill='#fff'/><ellipse cx='55' cy='72' rx='7' ry='17' fill='#d9e0fa'/><ellipse cx='65' cy='72' rx='7' ry='17' fill='#e9fad9'/><ellipse cx='66' cy='84' rx='6' ry='3' fill='#b798ff'/><ellipse cx='54' cy='84' rx='6' ry='3' fill='#b798ff'/></svg>";
    },
    {
      id = 9;
      name = "Pastel Confident Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#f2ecff'/><ellipse cx='60' cy='75' rx='27' ry='14' fill='#e9fad9'/><ellipse cx='63' cy='82' rx='7.5' ry='16' fill='#e6ffe6'/><ellipse cx='58' cy='82' rx='7.5' ry='16' fill='#e6ffe6'/><ellipse cx='65' cy='96' rx='5.5' ry='2' fill='#b798ff'/><ellipse cx='54' cy='96' rx='5.5' ry='2' fill='#b798ff'/></svg>";
    },
    {
      id = 10;
      name = "Pastel Wavey Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#fffbed'/><ellipse cx='60' cy='80' rx='22' ry='9' fill='#e5f5f3'/><ellipse cx='62' cy='85.5' rx='5' ry='12.5' fill='#d9e0fa'/><ellipse cx='58' cy='85.5' rx='5' ry='12.5' fill='#e0f7fa'/><ellipse cx='64.5' cy='92.5' rx='3' ry='1.5' fill='#ffd6ad'/><ellipse cx='57.5' cy='92.5' rx='3' ry='1.5' fill='#16e8b4'/></svg>";
    },
    {
      id = 11;
      name = "Pastel Zen Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#fff8f2'/><ellipse cx='60' cy='85' rx='20.5' ry='3.5' fill='#e5f5f3'/><ellipse cx='61' cy='90.5' rx='4' ry='9.5' fill='#d9e0fa'/><ellipse cx='58.5' cy='90.5' rx='4' ry='9.5' fill='#e0f7fa'/><ellipse cx='63.5' cy='96' rx='2' ry='0.5' fill='#ffd6ad'/><ellipse cx='57.5' cy='96' rx='2' ry='0.5' fill='#16e8b4'/></svg>";
    },
    {
      id = 12;
      name = "Pastel Sparkle Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#f1f8e9'/><ellipse cx='60' cy='75' rx='19.5' ry='2.5' fill='#e5f5f3'/><ellipse cx='62' cy='80.3' rx='3.5' ry='6.5' fill='#d9e0fa'/><ellipse cx='58' cy='80.3' rx='3.5' ry='6.5' fill='#e0f7fa'/><ellipse cx='63' cy='84.2' rx='1.5' ry='0.3' fill='#ffd6ad'/><ellipse cx='57' cy='84.2' rx='1.5' ry='0.3' fill='#16e8b4'/></svg>";
    },
    {
      id = 13;
      name = "Pastel Strong Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#e5f5f3'/><ellipse cx='60' cy='70' rx='32' ry='24' fill='#fff'/><ellipse cx='55' cy='75' rx='7' ry='19' fill='#d1e4ff'/><ellipse cx='65' cy='75' rx='7' ry='19' fill='#d1e4ff'/><ellipse cx='60' cy='82' rx='16' ry='16' fill='#c99bb8'/><rect x='46' y='58' width='28' height='8' fill='#c99bb8'/><polygon points='46,58 60,52 74,58' fill='#c99bb8'/><ellipse cx='60' cy='85' rx='7' ry='14' fill='#ffeb91'/></svg>";
    },
    {
      id = 14;
      name = "Pastel Cozy Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#fff8f2'/><ellipse cx='60' cy='72' rx='32' ry='22' fill='#fff'/><ellipse cx='55' cy='75' rx='7' ry='18' fill='#dbbae4'/><ellipse cx='65' cy='75' rx='7' ry='18' fill='#bfd3e1'/><ellipse cx='60' cy='80' rx='1.5' ry='8' fill='#c1e19a'/><ellipse cx='60' cy='84.3' rx='16.6' ry='5.7' fill='#c1e19a'/><rect x='44.1' y='80.8' width='1.7' height='4.1' fill='#c1e19a'/><rect x='73.4' y='80.8' width='1.7' height='4.1' fill='#c1e19a'/></svg>";
    },
    {
      id = 15;
      name = "Pastel Floofy Tooth";
      svg =
        "<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><rect width='120' height='120' fill='#e7e5f4'/><ellipse cx='60' cy='70' rx='34' ry='28' fill='#fff'/><ellipse cx='55' cy='72' rx='8' ry='22' fill='#d9e0fa'/><ellipse cx='65' cy='72' rx='8' ry='22' fill='#d9e0fa'/><ellipse cx='66' cy='91' rx='6' ry='4' fill='#b798ff'/><ellipse cx='54' cy='91' rx='6' ry='4' fill='#b798ff'/><rect x='78' y='86' width='30' height='8' fill='#b798ff'/><rect x='106' y='89' width='6' height='18' fill='#b798ff'/><ellipse cx='72' cy='106' rx='5' ry='7' fill='#fff'/><path d='M78 106q5-3 12.5 0' stroke='#b798ff' stroke-width='2' fill='none'/></svg>";
    },
  ];

  let accessControlState = AccessControl.initState();

  include MixinStorage();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getAllDentalAvatars() : async [DentalAvatar] {
    if (dentalAvatars.size() == 16) {
      let avatars : [DentalAvatar] = dentalAvatars.values().toArray();
      if (avatars.size() == 16) {
        return avatars;
      };
    };
    defaultDentalAvatars;
  };

  public shared ({ caller }) func selectRoleManager(_token : Text) : async () {
    if (_token != "ICPmaxi313") {
      Runtime.trap("Invalid token: Please make sure you entered the Manager token correctly ");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public shared ({ caller }) func selectRoleAssistant() : async () {
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  public shared ({ caller }) func createOvertimeEntry(minutes : Int, date : Time.Time) : async OvertimeEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create overtime entries");
    };

    if (minutes == 0) {
      Runtime.trap("Invalid overtime entry: Minutes must be non-zero");
    };

    let now = Time.now();

    if (date > now) {
      Runtime.trap("Invalid overtime entry: Date must not be in the future");
    };

    let twoMonthsNS : Int = 60 * 86400_000_000_000;

    if (now - date > twoMonthsNS) {
      Runtime.trap("Invalid overtime entry: Date must not be older than 2 months");
    };

    let overtimeEntry : OvertimeEntry = {
      id = nextOvertimeId;
      date;
      createdBy = caller;
      minutes;
      approvedBy = null;
      approved = false;
    };

    if (not overtimeEntries.containsKey(caller)) {
      let empty = List.empty<OvertimeEntry>();
      overtimeEntries.add(caller, empty);
    };

    switch (overtimeEntries.get(caller)) {
      case (null) { Runtime.trap("Overtime entry error: List could not be retrieved") };
      case (?userEntries) {
        userEntries.add(overtimeEntry);
      };
    };

    nextOvertimeId += 1;
    overtimeEntry;
  };

  public query ({ caller }) func getCallerOvertimeEntries() : async [OvertimeEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view overtime entries");
    };
    switch (overtimeEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getUserOvertimeEntries(user : Principal) : async [OvertimeEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other users' overtime entries");
    };

    switch (overtimeEntries.get(user)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getDecisionEntries() : async [DecisionEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view decision entries");
    };
    decisionEntries.toArray();
  };

  public query ({ caller }) func getTasks() : async [Task] {
    validateUserViaCaller(caller);
    tasks.values().toArray();
  };

  public shared ({ caller }) func createTask(title : Text, description : Text, taskType : TaskType) : async () {
    validateUserViaCaller(caller);

    if (title.size() == 0) {
      Runtime.trap("Invalid task: title cannot be empty ");
    };
    if (description.size() == 0) {
      Runtime.trap("Invalid task: description cannot be empty ");
    };
    let id = nextTaskId;
    nextTaskId += 1;
    let task : Task = {
      id;
      title;
      description;
      taskType;
      isCompleted = false;
      currentCompletion = null;
      lastResetAt = Time.now();
      nextResetTimestamp = null;
    };
    tasks.add(id, task);
  };

  public shared ({ caller }) func completeTask(taskId : Nat32, comment : ?Text, beforePhoto : ?Storage.ExternalBlob, afterPhoto : ?Storage.ExternalBlob) : async () {
    validateUserViaCaller(caller);

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
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
      Runtime.trap("Unauthorized: Only users can perform this action");
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

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    validateAdminViaCaller(caller);
    userProfiles.entries().toArray();
  };

  public query ({ caller }) func exportTaskData() : async [Task] {
    validateAdminViaCaller(caller);
    tasks.values().toArray();
  };

  func validateAdminViaCaller(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles ");
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

  public shared ({ caller }) func resetRecurringTasksIfNeeded() : async () {
    validateUserViaCaller(caller);

    type DayWeek = { mon : Bool; tue : Bool; wed : Bool; thu : Bool; fri : Bool; sat : Bool; sun : Bool };

    let dayWeek : DayWeek = {
      mon = false;
      tue = false;
      wed = false;
      thu = false;
      fri = false;
      sat = false;
      sun = false;
    };

    let currentWeekday = switch ((Time.now() / (24 * 3600)) % 7) {
      case (0) { #thursday };
      case (1) { #friday };
      case (2) { #saturday };
      case (3) { #sunday };
      case (4) { #monday };
      case (5) { #tuesday };
      case (6) { #wednesday };
      case (_) { #sunday };
    };

    if (currentWeekday == #monday) {
      updateAndTrackResetTasks(func(task) { task.taskType == #weekly });
      let dayOfMonth = (Time.now() / (24 * 3600)) % 30;
      if (dayOfMonth >= 14 and dayOfMonth <= 20) {
        updateAndTrackResetTasks(func(task) { task.taskType == #monthly });
      };
    };
  };

  public shared ({ caller }) func uploadProfilePhoto(photo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload profile photos ");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          profilePhoto = ?photo;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func removeProfilePhoto() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove profile photos ");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          profilePhoto = null;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getProfilePhoto(user : Principal) : async ?Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profile photos ");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile.profilePhoto };
    };
  };
};
