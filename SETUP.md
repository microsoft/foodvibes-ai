# DEV

## 1. Step-by-step guide

[Quick start video](./Quick-Start.mp4)

### 1.1- Clone the repository and open it in a managed device

Once you clone the repository, open the folder using a linux-based terminal (e.g, WSL). You will also need to have docker installed on
your system.

### 1.2- Create Docker image, spin a container and configure foodvibes-ai

The process of Docker image creation, spinning up that image in a container and configuring foodvibes-ai running inside that container is done by opening a bash terminal, cd/enter into your repository's root folder and entering the command

```bash
./scripts/foodvibes/setup_docker.sh
```

This will 

1- Create a new Docker image
2- Sping that new Docker image in a container
3- Start an interactive bash shell in that container

Once inside the container, use

```bash
setup.sh
```

to configure and start foodvibes-ai. The setup process will log you in Azure (if needed) and then will prompt for a number of installation-specific parameters such as

1- Azure location
2- FarmVibes.ai URL
3- Bing Maps API key
4- AppInsights API key
5- Azure SQL database credentials
6- ADMA URL and connection mode

Once all information has been gathered it will

1- Create a new Azure Resource Group
2- Create a new key vault
3- Create a new Entra ID SPA App (used for authentication of clients)
4- Create a new BLOB storage account and uploads sample images
5- Createa new Azure SQL database server and instance and creates sample data
6- Install backend API
7- Install fontend UI
8- Start both backend API and fontend UI

The frontend UI will be avaialble under http://localhost:3000 and the backend OpenAPI interface will be under http://localhost:7478

Note: To stop the foodvibes-ai simply hit CTL-C.

To restart foodvibes-ai use
```bash
setup_launch.sh
```

To reconfigure and restart foodvibes-ai use
```bash
setup.sh
```

### 1.3- Scripts and details (optional information)

The foodvibes.ai/scripts/foodvibes/ folder contains a number of scripts that may be run inidividually to install/update various componets of the system. They are:

#### setup.sh
This is the umbrella script that invokes others in sequence.

Note: This script (as well as all others accepts an optional argument as follows)
```bash
setup.sh # For normal setup or
setup.sh -1 # For verbose/debug-enabled setup
```
This setup script may be run multiple times to update configuration values and or to retry failed steps. It is recommended to initially accept all default values when prompted.

#### setup_key_vault.sh
This script is the first set of actions that creates/update resources needed by most other scripts. It may be run to update foodvibes-ai configuration.

#### setup_api.sh
This script will set up the api component of foodvibes-ai.

#### setup_ui.sh
This script will set up the ui component of foodvibes-ai.

#### setup_database.sh
This script will set up the foodvibes-ai database. If database configuration has changed (under setup_key_vault.sh) then this script needs to be rerun to ensure database can be accessed.

#### setup_launch.sh
This script will start both api and ui components of foodvibes-ai.

#### setup_farmvibes.sh
This is a standalone script that will create and start a local instance of farmvibes-ai which is used to pull deforestation images to overlay in foodvibes-ai maps. Please note that farmvibes-ai works in conjunction with ADMA.

Note: For FarmVibes.ai additional information please refer to [this document](https://github.com/microsoft/farmvibes-ai/blob/main/README.md)

#### setup_docker.sh
This is a standalone script that is used to create a Docker image and to spin up a Docker container using that image. The Docker container is where setup.sh will be used to configure and start foodvibes-ai. 


## 2. Software dependencies

All dependencies should be resolved withing Docker image created by setup_docker.sh script in the previous section

## 3. Latest releases

Release 1.0.0

## 4. API references

WepAPI interactive reference may be found by starting this foodvibes-ai and going to [/docs page](https://localhost:7478/docs)

# Build and Test

All build and test operations are automatically performed by setup.sh script described above.

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
