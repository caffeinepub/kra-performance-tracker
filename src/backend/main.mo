import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat32 "mo:core/Nat32";
import Order "mo:core/Order";
import Bool "mo:core/Bool";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Import shared types from access-control module for role-based access
  type UserRole = AccessControl.UserRole;

  // KRA types and data
  type Rating = Nat32;
  type Byte = Nat8;

  module Rating {
    public func toText(r : Rating) : Text {
      r.toNat64().toText();
    };
    public func compare(r1 : Rating, r2 : Rating) : Order.Order {
      Nat32.compare(r1, r2);
    };
  };

  public type KRAEntry = {
    id : Nat;
    period : Text;
    particulars : Text;
    selfRating : ?Rating;
    hodRating : ?Rating;
    createdBy : Principal;
    createdAt : Time.Time;
  };

  module KRAEntry {
    public func compare(kra1 : KRAEntry, kra2 : KRAEntry) : Order.Order {
      Int.compare(kra1.createdAt, kra2.createdAt);
    };
  };

  public type UserProfile = {
    name : Text;
    employeeId : ?Text;
  };

  // Store all of KRA data - id:KRAEntry
  let kraEntries = Map.empty<Nat, KRAEntry>();
  var nextID = 0;

  // User profiles storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization system state and mixin include
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper to check if principal has HOD role (mapped to admin)
  func isHOD(caller : Principal) : Bool {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin) { true };
      case (#user) { false };
      case (#guest) { false };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // KRA Entry Management
  public shared ({ caller }) func createKRAEntry(period : Text, particulars : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only employees and HODs can create KRA entries");
    };

    let entry : KRAEntry = {
      id = nextID;
      period;
      particulars;
      selfRating = null;
      hodRating = null;
      createdBy = caller;
      createdAt = Int.abs(Time.now());
    };
    kraEntries.add(nextID, entry);
    nextID += 1;
    entry.id;
  };

  public shared ({ caller }) func submitSelfRating(id : Nat, rating : Rating) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit self ratings");
    };

    switch (kraEntries.get(id)) {
      case (null) { Runtime.trap("KRA entry not found") };
      case (?entry) {
        if (entry.createdBy != caller) {
          Runtime.trap("Unauthorized: Only creator can submit self rating");
        };
        if (rating < 1 or rating > 5) {
          Runtime.trap("Invalid rating: must be between 1 and 5");
        };
        let updatedEntry : KRAEntry = {
          id = entry.id;
          period = entry.period;
          particulars = entry.particulars;
          selfRating = ?rating;
          hodRating = entry.hodRating;
          createdBy = entry.createdBy;
          createdAt = entry.createdAt;
        };
        kraEntries.add(id, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func submitHODRating(id : Nat, rating : Rating) : async () {
    if (not (isHOD(caller))) {
      Runtime.trap("Unauthorized: Only HODs can submit HOD ratings");
    };

    switch (kraEntries.get(id)) {
      case (null) { Runtime.trap("KRA entry not found") };
      case (?entry) {
        if (rating < 1 or rating > 5) {
          Runtime.trap("Invalid rating: must be between 1 and 5");
        };
        let updatedEntry : KRAEntry = {
          id = entry.id;
          period = entry.period;
          particulars = entry.particulars;
          selfRating = entry.selfRating;
          hodRating = ?rating;
          createdBy = entry.createdBy;
          createdAt = entry.createdAt;
        };
        kraEntries.add(id, updatedEntry);
      };
    };
  };

  // CRUD operations - update/delete
  public shared ({ caller }) func updateKRAEntry(id : Nat, period : Text, particulars : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update KRA entries");
    };

    switch (kraEntries.get(id)) {
      case (null) { Runtime.trap("KRA entry not found") };
      case (?entry) {
        if (entry.createdBy != caller) {
          Runtime.trap("Unauthorized: Only creator can update entry");
        };
        let updatedEntry : KRAEntry = {
          id = entry.id;
          period;
          particulars;
          selfRating = entry.selfRating;
          hodRating = entry.hodRating;
          createdBy = entry.createdBy;
          createdAt = entry.createdAt;
        };
        kraEntries.add(id, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func deleteKRAEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete KRA entries");
    };

    switch (kraEntries.get(id)) {
      case (null) { Runtime.trap("KRA entry not found") };
      case (?entry) {
        if (entry.createdBy != caller and not isHOD(caller)) {
          Runtime.trap("Unauthorized: Only creator or HOD can delete entry");
        };
        kraEntries.remove(id);
      };
    };
  };

  // Query operations
  public query ({ caller }) func getKRAEntry(id : Nat) : async ?KRAEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KRA entries");
    };
    kraEntries.get(id);
  };

  public query ({ caller }) func getAllKRAEntries() : async [KRAEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KRA entries");
    };

    let entries = Array.fromIter(kraEntries.values());
    entries.sort();
  };

  public query ({ caller }) func getKRAEntriesByPeriod(period : Text) : async [KRAEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KRA entries");
    };

    let filtered = Array.fromIter(kraEntries.values()).filter(
      func(entry : KRAEntry) : Bool { entry.period == period }
    );
    filtered.sort();
  };

  public query ({ caller }) func getMyKRAEntries() : async [KRAEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view KRA entries");
    };

    let filtered = Array.fromIter(kraEntries.values()).filter(
      func(entry : KRAEntry) : Bool { entry.createdBy == caller }
    );
    filtered.sort();
  };

  // Summary statistics
  public type PeriodSummary = {
    period : Text;
    totalEntries : Nat;
    averageSelfRating : ?Float;
    averageHODRating : ?Float;
  };

  public query ({ caller }) func getSummaryByPeriod(period : Text) : async PeriodSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view summaries");
    };

    let filtered = Array.fromIter(kraEntries.values()).filter(
      func(entry : KRAEntry) : Bool { entry.period == period }
    );

    var totalSelfRating : Nat = 0;
    var countSelfRating : Nat = 0;
    var totalHODRating : Nat = 0;
    var countHODRating : Nat = 0;

    for (entry in filtered.vals()) {
      switch (entry.selfRating) {
        case (?rating) {
          totalSelfRating += rating.toNat();
          countSelfRating += 1;
        };
        case (null) {};
      };
      switch (entry.hodRating) {
        case (?rating) {
          totalHODRating += rating.toNat();
          countHODRating += 1;
        };
        case (null) {};
      };
    };

    let avgSelf = if (countSelfRating > 0) {
      ?(totalSelfRating.toFloat() / countSelfRating.toFloat());
    } else {
      null;
    };

    let avgHOD = if (countHODRating > 0) {
      ?(totalHODRating.toFloat() / countHODRating.toFloat());
    } else {
      null;
    };

    {
      period;
      totalEntries = filtered.size();
      averageSelfRating = avgSelf;
      averageHODRating = avgHOD;
    };
  };

  public query ({ caller }) func getAllSummaries() : async [PeriodSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view summaries");
    };

    let periods = ["daily", "monthly", "quarterly"];
    periods.map<Text, PeriodSummary>(
      func(period : Text) : PeriodSummary {
        let filtered = Array.fromIter(kraEntries.values()).filter(
          func(entry : KRAEntry) : Bool { entry.period == period }
        );

        var totalSelfRating : Nat = 0;
        var countSelfRating : Nat = 0;
        var totalHODRating : Nat = 0;
        var countHODRating : Nat = 0;

        for (entry in filtered.vals()) {
          switch (entry.selfRating) {
            case (?rating) {
              totalSelfRating += rating.toNat();
              countSelfRating += 1;
            };
            case (null) {};
          };
          switch (entry.hodRating) {
            case (?rating) {
              totalHODRating += rating.toNat();
              countHODRating += 1;
            };
            case (null) {};
          };
        };

        let avgSelf = if (countSelfRating > 0) {
          ?(totalSelfRating.toFloat() / countSelfRating.toFloat());
        } else {
          null;
        };

        let avgHOD = if (countHODRating > 0) {
          ?(totalHODRating.toFloat() / countHODRating.toFloat());
        } else {
          null;
        };

        {
          period;
          totalEntries = filtered.size();
          averageSelfRating = avgSelf;
          averageHODRating = avgHOD;
        };
      }
    );
  };
};
