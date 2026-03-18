# KRA Performance Tracker

## Current State
New project, no existing application.

## Requested Changes (Diff)

### Add
- KRA (Key Result Areas) application
- Tasks organized by period: Daily, Monthly, Quarterly
- Each task has: Particulars (description), Self Rating, HOD Rating
- Employees can add tasks and submit self ratings
- HOD (Head of Department) can submit HOD ratings
- Role-based access: Employee vs HOD
- Dashboard view showing all KRA entries grouped by period
- Ability to add/edit/delete KRA entries
- Rating scale (e.g. 1-5 or 1-10)
- Summary/aggregate view of ratings per period

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Authorization component for Employee and HOD roles
2. Backend: KRA entry data model with period, particulars, selfRating, hodRating
3. Backend APIs: create, read, update, delete KRA entries; submit self/HOD ratings
4. Frontend: Dashboard with tabs for Daily/Monthly/Quarterly
5. Frontend: Table view with columns - Particulars, Self Rating, HOD Rating, Actions
6. Frontend: Add/Edit form for KRA entries
7. Frontend: Role-aware UI (employee sees self rating input, HOD sees HOD rating input)
