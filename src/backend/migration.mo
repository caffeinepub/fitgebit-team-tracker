import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
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
    taskType : TaskType;
    isCompleted : Bool;
    currentCompletion : ?TaskCompletion;
    lastResetAt : Time.Time;
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

  public type OldActorState = {
    tasks : Map.Map<Nat32, Task>;
    decisionEntries : List.List<DecisionEntry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    overtimeEntries : Map.Map<Principal, List.List<OvertimeEntry>>;
    nextTaskId : Nat32;
    nextOvertimeId : Nat32;
    dentalAvatars : Map.Map<Nat32, DentalAvatar>;
  };

  public type NewTask = {
    id : Nat32;
    title : Text;
    description : Text;
    taskType : TaskType;
    isCompleted : Bool;
    currentCompletion : ?TaskCompletion;
    lastResetAt : Time.Time;
  };

  public type NewActorState = {
    tasks : Map.Map<Nat32, NewTask>;
    decisionEntries : List.List<DecisionEntry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    overtimeEntries : Map.Map<Principal, List.List<OvertimeEntry>>;
    nextTaskId : Nat32;
    nextOvertimeId : Nat32;
    dentalAvatars : Map.Map<Nat32, DentalAvatar>;
  };

  public func run(old : OldActorState) : NewActorState {
    let newTasks = old.tasks.map<Nat32, Task, NewTask>(
      func(_id, task) {
        {
          task with
          description = "Please update this description";
        };
      }
    );
    {
      old with
      tasks = newTasks;
    };
  };
};
