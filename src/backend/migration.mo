import Map "mo:core/Map";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type ProfileRole = {
    #manager;
    #assistant;
  };

  type DentalAvatar = {
    id : Nat32;
    name : Text;
    svg : Text;
  };

  type TaskType = {
    #weekly;
    #monthly;
    #urgent;
  };

  type RepeatInterval = {
    #daily;
    #weekly;
    #monthly;
  };

  type DecisionType = {
    #valid;
    #invalid;
    #critical;
  };

  type TaskCompletion = {
    completedBy : Principal;
    comment : ?Text;
    beforePhoto : ?Storage.ExternalBlob;
    afterPhoto : ?Storage.ExternalBlob;
    completedAt : Time.Time;
  };

  type Task = {
    id : Nat32;
    title : Text;
    taskType : TaskType;
    isCompleted : Bool;
    currentCompletion : ?TaskCompletion;
    lastResetAt : Time.Time;
  };

  type DecisionEntry = {
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

  type OldUserProfile = {
    username : Text;
    avatar : Nat32;
    role : ProfileRole;
  };

  type NewUserProfile = {
    username : Text;
    initials : Text;
    avatar : Nat32;
    profilePhoto : ?Storage.ExternalBlob;
    role : ProfileRole;
  };

  type OldActor = {
    tasks : Map.Map<Nat32, Task>;
    decisionEntries : List.List<DecisionEntry>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextTaskId : Nat32;
    dentalAvatars : Map.Map<Nat32, DentalAvatar>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    tasks : Map.Map<Nat32, Task>;
    decisionEntries : List.List<DecisionEntry>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    nextTaskId : Nat32;
    dentalAvatars : Map.Map<Nat32, DentalAvatar>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    // Migrate user profiles, integrating new fields with defaults
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          oldProfile with
          initials = "";
          profilePhoto = null;
        };
      }
    );

    {
      old with
      userProfiles = newUserProfiles;
    };
  };
};
