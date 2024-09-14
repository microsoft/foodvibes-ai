# foodvibes-ai Roles & Permissions Overview

## Entity definition

### User-data entities

| **Entity**                 | **Description**                                                                                                                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product (P)**            | A unique foodvibes-ai record that represents a food item (e.g. coffee) or an aggregation of food items (e.g. bag of potatoes). It answers WHAT question.                                                                                                                                               |
| **Geotrack (G)**           | A unique location where a Product is created, processed, stored, transported or consumed. It answers the WHERE question.                                                                                                                                                                            |
| **Tracking Products (TP)** | A logical foodvibes-ai record that traces a food from farm to table. This record’s history of changes (ledger) represents Supply Chain (SC) activity related to the original Product and Geotrack combination all the way to the final Product and Geotrack combination. It answers the WHEN question. |

### Security-data entities

| **Entity**                  | **Description**                                                                                                                                                                                                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supply Chain User**       | A user who can access User-data entities based on defined roles and permissions.                                                                                                                                                                                                                   |
| **Supply Chain Group**      | A virtual grouping to be used as a common element in a Supply Chain Group User (see next entry).                                                                                                                                                                                                   |
| **Supply Chain Group User** | An entry that binds a Supply Chain User to a Supply Chain Group. The same user may be bound to multiple groups. The same group may be bound to multiple users. Users who share the same group will have access to one-another’s data based on the access mask defined for each user in that group. |

## Modules

- **Database**: Stores all user-data entities (Product, Geotrack & Tracking Products) as well as system security data entities (Supply Chain Users, Supply Chain Groups & Supply Chain GroupUser).
- **Web API**: Provides Create/Read/Update/Delete (CRUD) operations executed against database tables based on roles and permissions defined in system security data tables.
- **Web UI**: Provides screens to interact with data stored in Database via Web API.

<insert slide showing how Product, Geotrack & Tracking Products relate to one another>

Externally, foodvibes-ai accesses ADMA for farm boundary information and FarmVibes.ai for images of farms falling within ADMA-provided boundaries.

## Roles & Permissions

### Role assignee definitions

| **Entity**                    | **Description**                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product Owner (PO)**        | A user who can own one or more Product entries.                                                                                                                                                                                                                                                                                                                             |
| **Geotrack Owner (GO)**       | A user who can own one or more Geotrack entries.                                                                                                                                                                                                                                                                                                                            |
| **Supply Chain Owner (SCO)**  | A user who can own one or more supply chain (SC) data comprised of Product database table records, Geotrack database table records, and Tracking Products database table records.                                                                                                                                                                                           |
| **Supply Chain Viewer (SCV)** | A user who has read-only access to one or more supply chain (SC) data but cannot create or update any data.                                                                                                                                                                                                                                                                 |
| **Supply Chain Group (SCG)**  | A grouping of users (PO, GO, SCO and SCV) who participate in a single SC. A valid SCG must contain at least one PO, one GO and one SCO. SCV is optional. A user in each SCG will access all data based on their role(s) in that SCG. A user may belong to multiple SCGs as PO, GO, SCO or SCV. A user may hold any combination of PO, GO, SCO and SCV roles in the same SC. |

### Role definitions

| **Role**                            | **Permissions in SCG**                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product Owner Role (POR)**        | Product data: Can only create new records under their own name. Can only view and update records where they are owner. Geotrack data: No access. Tracking Products data: Cannot create/update records. Can only view records where their Product records are used. View of records (journey, ledger & graph) is limited to one immediate node before and one immediate node after records in which their Product records are used.                                                           |
| **Geotrack Owner Role (GOR)**       | Product data: No access. Geotrack data: Can only create/update records under their own name. Can only view and update records where they are owner. Tracking Products data: Cannot create/update records. Can only view records where their Geotrack records are used. View of records (journey, ledger & graph) is limited to one immediate node before and one immediate node after records in which their Geotrack records are used.                                                      |
| **Supply Chain Owner Role (SCOR)**  | Product data: Can create new records under any user in the same SCG who is designated as PO. Can view and update all records. Geotrack data: Can create new records under any user in the same SCG who is designated as GO. Can view and update all records. Tracking Products data: Can only create new records under any user in the same SCG who is designated as SCO. Can view and update all records. View of records (journey, ledger & graph) is not limited and spans the entire SC. |
| **Supply Chain Viewer Role (SCVR)** | This user has similar privileges as SCOR except that it’s for viewing data and no data creation or update is permitted. Typically this role is assigned to an auditor, inspector or government representative.                                                                                                                                                                                                                                                                               |
| **Global Owner Role (GLOR)**        | A user holding GLOR assumes the role of SCOR in all SCGs. A user holding GLOR does not need to belong to a given SCG to assume SCOR role in that SCG.                                                                                                                                                                                                                                                                                                                                        |

### Example:

Given the following entities:

- **P1** owned by PO1 with POR in SCG1 – Arabica coffee beans
- **P2** owned by PO2 with POR in SCG1 – Coffee 60kg bag
- **P3** owned by PO3 with POR in SCG1 – Coffee powder
- **G1** owned by GO1 with GOR in SCG1 – Coffee farm
- **G2** owned by GO2 with GOR in SCG1 – Coffee processor
- **G3** owned by GO3 with GOR in SCG1 – Shipper
- **G4** owned by GO4 with GOR in SCG1 – Coffee grinder
- **G5** owned by GO5 with GOR in SCG1 – Coffee consumer

**Access Granted**

- PO1 can update P1 and view P1 & P2 only
- PO2 can update P2 and view P1, P2 & P3 only
- PO3 can update P3 and view P2 & P3 only
- GO1 can update G1 and view G1 & G2 only
- GO2 can update G2 and view G1, G2 & G3 only
- GO3 can update G3 and view G2, G3 & G4 only
- GO4 can update G4 and view G3, G4 & G5 only
- GO5 can update G5 and view G4 & G5 only
- SCO1 in SCG1 can update and view all P1-P3 and G1-G5 data
- SCV1 can view all P1-P3 and G1-G5 data
- Anyone with GLOR has access to all SCG1 data

**Access Denied**

- PO1 cannot view/update P3, G1-G5
- PO2 cannot view/update G1-G5
- PO3 cannot view/update P1, G1-G5
- GO1 cannot view/update P1-P3, G3-G5
- GO2 cannot view/update P1-P3, G4-G5
- GO3 cannot view/update P1-P3, G1 or G5
- GO4 cannot view/update P1-P3, G1-G2
- GO5 cannot view/update P1-P3, G1-G3
- SCO2 in SCG2 has no access to SCG1 data
- SCV1 cannot update P1-P3 or G1-G5 data

### Legend

- **P1**: Product 1 (same scheme for P2 and P3)
- **POR**: Product Owner Role
- **PO1**: Product Owner 1 (same scheme for PO2 and PO3)
- **GOR**: Geotrack Owner Role
- **G1**: Geotrack 1 (same scheme for G2, G3, G4 and G5)
- **SCOR**: Supply Chain Owner Role
- **GO1**: Geotrack Owner 1 (same scheme for GO2, GO3, GO4 and GO5)
- **SCVR**: Supply Chain Viewer Role
- **SCO1**: Supply Chain Owner 1 (same scheme for SCO2)
- **GLOR**: Global Owner Role
- **SCG1**: Supply Chain Group 1 (same scheme for SCG2)
- **SCV1**: Supply Chain Viewer 1
