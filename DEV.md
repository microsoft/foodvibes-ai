# DEV

We recommend the usage of the provided devcontainer with VSCode to develop
FoodVibes.

## Step-by-step guide

### 1- Clone the repository and open it in a managed device

Once you cloned the repository, open the folder using a Microsoft
managed machine (windows or WSL). You will also need to have docker installed on
your system.

### 2- Install devcontainer extension

[Here](https://code.visualstudio.com/docs/devcontainers/containers) you will find instructions on how to install devcontainers on VSCode.

Usually you only need to search the Dev Containers extension on the extensions pane and install it. Once the extension is installed, you can open the VSCode command pallete `Ctrl` + `Shift` + `P`, type `Dev
Containers: Open Folder in Container` and select the repository root.

Once you do it, VSCode will create the dev container to you.

### 3- Install/update your FoodVibes installation and start services (first-time only for a newly cloned repo)

Open the terminal and cd to your repository's root folder and enter

```bash
./scripts/foodvibes/setup.sh
```

this will log you in Azure (if needed) and then will prompt for a number of installation-specific parameters such as

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

### 4- Start services (after first-time installation)

Open the terminal and cd to your repository's root folder and enter

```bash
./scripts/foodvibes/setup_launch.sh
```

this will log you in Azure (if needed) and then will

- Start both backend API and fontend UI

The frontend UI will be avaialble under http://localhost:3000 and the backend OpenAPI interface will be under http://localhost:7478

### 5- Create a turnkey Docker image

To create a turnkey Docker image  that could be used as a self-contained FoodVibes "box" (both backend API and frontend UI),
open the terminal and cd to your repository's root folder and enter

```bash
./scripts/foodvibes/setup_docker.sh
```

and follow prompts and instructions presented. This creates a new Docker image and spin up a container using that image.
In a newly created container, the setup steps (see #3 above) will configure FoodVibes within the container. The container
will then be used as a persistent instance of FoodVibes.