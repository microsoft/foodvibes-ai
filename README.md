# Quick start (Docker)

Clone this repo to a local folder and run
```
    cd foodvibes.ai
    ./scripts/setup/foodvibes/setup_docker.sh
```
and follow prompts

# Introduction

# FoodVibes Supply Chain Traceability

## Supply Chain Tracking platform

Supply Chain Tracking platform for the European Union’s Deforestation-free product regulation (EUDR), the FDA’s Food Safety and Modernization Act (FSMA) and other Food Supply Chain Regulations that mandate tracking products together with Geo-location and their relevant compliance insights all the way back to the origin of the product.


## Example

Example to understand the ability to track deforestation and deforestation-free coffee from its origin through multiple transformations.

## Overview

FoodVibes provides the building blocks for enabling end-to-end traceability in Supply Chains. It was built with the aim of supporting sustainability goals in the Food Supply Chain but can be adapted for other global supply chains too. FoodVibes tracks the products through the supply chain along with time and location which enables a better lifecycle assessment to reduce wastage, track carbon footprint and meet regulations.

## Features

The features that FoodVibes enables are:

- **Trusted information tracking through immutable ledgers:** The database is built on top of immutable ledgers. While keeping things simple, the ledger framework provides a layer of immutability that prevents data manipulation.
- **3W tracking:** FoodVibes tracks the When, What and Where of the products. This is done through three ledgers.
  - First the GeoTrack Ledger, which is a registry of all known GeoLocations registered by Supply chain stake holders.
  - Second is the Product Ledger, which is a registry of new instances of products.
  - Lastly the Tracking Products Ledgers, which connects the dots across time and space. It tracks the transformation of products from the previous steps to current steps (i.e aggregation/disaggregation/transformation) and it tracks movement of products from one location to the next. These create associations across geoTrack and Product Ledger instances.
- **Role-based information access:** FoodVibes also defines a preliminary role-based access approach. It is understood that not all information is visible to every supply chain entity. Data Visibility is indicated by the roles and their association with other stakeholder users. This is further limited by the product level association through Product Tracking Ledger.
- **Geo-location and related information tracking:** FoodVibes provides a means to connect Geotrack ledger entries with location coordinates, geopolygons and location-indexed information that can be defined for each entity in tools like the Azure Data Manager for Agriculture (ADMA). This provides a means to not only track the product, but also its relevant information from each location and time (like storage temperature, certifications) along with it.
- **Remote sensing insights:** It also connects with FarmVibes.ai, which is an opensourced satellite-based geospatial insight generation tool. This is helpful for gaining macro insights associated with locations that the product travels through. We demonstrate the example of analyzing deforestation at supply chain locations through satellite-based maps. A few other examples include understanding the weather during harvest, rainfall, built environment and land degradation associated with the supply chain locations. These insights can also help with risk assessment.

## Roles & Permissions

For an overview of Roles & Permissions in FoodVibes, see [ROLES_PERMISSION.md](ROLES_PERMISSIONS.md) in this folder.

# Getting Started (localhost)

## 1. Installation process

To install FoodVibes and its supporting systems, the following steps will be required:

### 1- Clone this repo to a local folder

### 2- Change directory to the parent of the just-cloned repo and run

```
./foodvibes.ai/scripts/foodvibes/setup.sh # For normal setup or
./foodvibes.ai/scripts/foodvibes/setup.sh -1 # For verbose/debug-enabled setup
```

Note: This setup script may be run multiple times to update configuration values and or to retry failed steps. It is recommended to initially accept all default values when prompted.

#### The setup process will prompt you for a number of application-related parameters and key values. They are:

a- Azure "Resource Group Name": key RESOURCE_GROUP_NAME (default "foodvibes-test-rg")
This value is used to create an Azure resource group that will contain all related resources to this FoodVibes installation.

b- Azure "Resource Group Location": key RESOURCE_GROUP_LOCATION (default "West US")
This is the location or region for the Azure resource group. It is recommended to select an Azure location that is closest to where FoodVibes will be most heavily used.

c- Azure "Entra ID App Name": key ENTRA_ID_APP_NAME (default "foodvibes-test-00") -- Note: this value needs to contain only letters, numbers, underscores & hyphens (always starting with letters)
This is the name of Azure Entra ID Single Page Application app that will be used to authenticate the FoodVibes users using Entra ID authentication. All users for FoodVibes must belong to the same Azure app tenant as where this FoodVibes installation is being created.

d- Azure "Key Vault Name": key KEY_VAULT_NAME (default is dynamically generated)-- Note: this value needs to be universally unique and contain only letters, numbers & hyphens (always starting with letters)
This is the name of Azure key value that will store all configuration information used by FoodVibes API server.

e- Azure "Database Instance Name": key DATABASE_NAME (default "foodvibes_db")
This is the name of Azure SQL database instance that will house all FoodVibes data.

f- Azure "Database Server Name": key DATABASE_SERVER (default is dynamically generated) -- Note: this value needs to be universally unique and contain only letters, numbers & hyphens (always starting with letters)
This is the name of Azure SQL database server that will host the Azure SQL database instance specified above.

f- Azure BLOB Storage Container name (default is dynamically generated)
This is the name of Azure BLOB storage container that will house FoodVibes images (product, geotrack and deforestation images).

g- Azure BLOB Storage account name (default is dynamically generated) -- Note: this value needs to contain only letters, numbers & NO hyphens (always starting with letters)
This is the name of Azure BLOB storage account that will be used to access Azure BLOB container specified above.

h- ADMA config data consisting of
ADMA_BASE_URL (default "<YOUR ADMA URL>")
ADMA_PARTY_ID (default "<YOUR ADMA PARTY ID>")
ADMA_AUTHORITY=""
ADMA_CLIENT_ID=""

FARMVIBES_URL="http://localhost:31108"
BINGMAPS_API_KEY="<YOUR KEY>"
APP_INSIGHTS_INSTRUMENTATION_KEY="<YOUR KEY>"
ENTRA_ID_APP_NAME="foodvibes-test-00"
ENTRA_ID_APP_ID="<YOUR ID>"

### 1- Ensure that you have an active Azure subscription and can create and manage

#### 1.a- SQL Database instances (see https://learn.microsoft.com/en-us/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal, https://learn.microsoft.com/en-us/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal & https://learn.microsoft.com/en-us/azure/azure-sql/database/authentication-aad-configure?view=azuresql&tabs=azure-powershell)

##### 1.a.1- Ensure to allow your IP address to be accessed from FoodVibes API process.

##### 1.a.2- See appendix A below with instructions on how to install pyodbc and odbc

#### 1.b- BLOB storage (see https://learn.microsoft.com/en-us/azure/storage/blobs/blob-containers-portal)

#### 1.c- Key Vault (see https://learn.microsoft.com/en-us/azure/key-vault/general/quick-create-portal)

##### 1.c.a- Permissions needed for key vault:

###### 1.c.a.1- Key Vault Secrets Officer to the KeyVault

###### 1.c.a.2- Storage Blob Data Contributor to the Storage Account

#### 1.d- Entra ID Applications (see https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app?tabs=certificate & )

#### 1.e- Bing maps key (see https://learn.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key)

#### 1.f- App insights key (see https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview) -- Note: key format is "InstrumentationKey=<Key Value>;IngestionEndpoint=<Link>;LiveEndpoint=<Another Link>;ApplicationId=<App Id Value>"

#### 1.g- Install python 3.10 or newer (see https://www.python.org/downloads/release/python-3100/)

#### 1.h- Install node 20 or newwer (see https://nodejs.org/en/download/package-manager/current)

### 2- Create an instance of SQL Server with Role Based Access Control granted to the user account setting up FoodVibes

### 3- git clone this repo

### 4- From a folder outside the repo snapshot, run <local-root>/foodvibes.ai/scripts/foodvibes/setup.sh to install the following:

### 4.a- ADMA for location boundaries service

#### 4.b- FarmVibes.ai for deforestation images service

#### 4.c- Azure Key Vault and its secrets where the following unique values will be specified:

##### 4.c.1- adma-client-secret -- used to connect to ADMA

##### 4.c.2- farmvibes-url -- used to connect to FarmVibes.ai

##### 4.c.3- bingmaps-api-key -- maps key from user's own subscription

##### 4.c.4- entra-id-client-id -- App ID from user's own subscription of the app associated with FoodVibes for client authentication

##### 4.c.5- foodvibes-app-insights-instrumentation-key -- Azure App Insights instrumentation key from user's own subscription

##### 4.c.6- foodvibes-connection-string -- Database connection string (from datbase name and url defined in step 1 above)

##### 4.c.7- images-blob-container-name -- Azure BLOB container name used to store images

##### 4.c.8- images-blob-service-url -- Azure BLOB service URL used to store images

#### 4.d- SQL Server database schema and sample data

#### 4.e- Install FoodVibes API libaries (may be performed using /src/scripts/foodvibes/setup_api.sh)

#### 4.f- Install FoodVibes UI modules (may be performed using /src/scripts/foodvibes/setup_ui.sh)

### 5- Open a new terminal and run <local-root>/foodvibes.ai/app.py to start FoodVibes API (listening on https://localhost:7478 by default)

### 6- Open a new terminal and run <local-root>/foodvibes.ai/ui/yarn start (running the UI on https://localhost:3000 by default)

Notes:

- For FarmVibes.ai additional information please refer to https://github.com/microsoft/farmvibes-ai/blob/main/README.md
- If any changes to the database is made then a new models Python template needs to be generated using <local-root>/foodvibes.ai/database/create-models.sh

## 2. Software dependencies

All dependencies should be resolved with pip install in the previous section

## 3. Latest releases

Release 1.0.0

## 4. API references

WepAPI interactive reference may be found by starting this FastAPI project and going to /docs page (e.g. https://localhost:7478/docs)

# Build and Test

TODO: Describe and show how to build your code and run the tests.

# Contribute

TBD

# Appendix A

Instructions on how to install pyodbc and odbc

## This code works for linux

### Import the public repository GPG keys

curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -

### Register the Microsoft Ubuntu repository

sudo add-apt-repository "$(curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list)"

### Update the package list and install the ODBC driver

sudo apt-get update
sudo apt-get install -y msodbcsql18

## Verify the installation

odbcinst -j
odbcinst -q -d -n "ODBC Driver 18 for SQL Server

--
Change log:
Feb. 28, 2024 -- C. Kasra v-cyruskasra@microsoft.com -- Initial release
Mar. 1, 2024 -- C. Kasra -- Addition of FastAPI to make dabase schema accessible for CRUD operations
Mar. 23, 2024 -- C. Kasra -- Addition of support for recorded_at and is_history columns
Aug. 9, 2024 -- C. Kasra -- Addition of Open Source Software setup scripts
Aug. 16, 2024 -- C. Kasra -- Incorporated information from Bruno Silva regarding enhancements including links and additional libraries and tools installations
