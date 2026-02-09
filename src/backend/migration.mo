import List "mo:core/List";
import Map "mo:core/Map";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

module {
  // New simplified types
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

  public type UserProfile = {
    username : Text;
    avatar : Nat32;
    role : {
      #manager;
      #assistant;
    };
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
    taskType : TaskType;
    isCompleted : Bool;
    currentCompletion : ?TaskCompletion;
    lastResetAt : Time.Time;
  };

  // Old types for migration
  type OldTask = {
    id : Nat32;
    title : Text;
    frequency : {
      #daily;
      #weekly;
      #monthly;
    };
    dueDate : Time.Time;
    priority : {
      #low;
      #normal;
      #high;
    };
    assignee : Principal;
    isCompleted : Bool;
    completionComment : ?Text;
    completionPhoto : ?Storage.ExternalBlob;
  };

  type OldActor = {
    tasks : Map.Map<Nat32, OldTask>;
    decisionEntries : List.List<DecisionEntry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextTaskId : Nat32;
    nextOvertimeId : Nat32; // obsolete field
    overtimeEntries : List.List<{ // obsolete type
      id : Nat32;
      userId : Principal;
      minutes : Nat32;
      isAddition : Bool;
      timestamp : Time.Time;
      comment : ?Text;
      photo : ?Storage.ExternalBlob;
    }>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    tasks : Map.Map<Nat32, Task>;
    decisionEntries : List.List<DecisionEntry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextTaskId : Nat32;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let migratedTasks = old.tasks.map<Nat32, OldTask, Task>(
      func(_id, oldTask) {
        {
          id = oldTask.id;
          title = oldTask.title;
          taskType = switch (oldTask.frequency) {
            case (#daily) { #weekly };
            case (#weekly) { #weekly };
            case (#monthly) { #monthly };
          };
          isCompleted = oldTask.isCompleted;
          currentCompletion = ?{
            completedBy = oldTask.assignee;
            comment = oldTask.completionComment;
            beforePhoto = oldTask.completionPhoto;
            afterPhoto = null;
            completedAt = Time.now();
          };
          lastResetAt = Time.now();
        };
      }
    );
    // Explicitly drop overtimeEntries and nextOvertimeId as they are no longer used
    { old with tasks = migratedTasks };
  };
};
