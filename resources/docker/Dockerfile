FROM mcr.microsoft.com/cbl-mariner/base/core:2.0 AS builder

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID
ENV PATH="/opt/conda/bin:${PATH}"
ENV LD_LIBRARY_PATH="/opt/conda/lib:${LD_LIBRARY_PATH}"

# Copy the source code
COPY api /app/api
COPY ui /app/ui
COPY .env /app/.env
COPY __init__.py /app/__init__.py
COPY resources/envs/env.yaml /app/resources/envs/env.yaml
COPY resources/docker /app/resources/docker
COPY resources/config-files /app/resources/config-files
COPY resources/bash-scripts /app/resources/bash-scripts
COPY resources/config-files/sshd_config /etc/ssh/sshd_config
COPY resources/config-files/nginx-config /etc/nginx/nginx.conf
COPY resources/config-files/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY scripts/foodvibes/ /app/setup/foodvibes/
COPY app.py /app/app.py

# Install dependencies
RUN tdnf update || echo "Not updating packages"

# Install dependencies
RUN tdnf install -y \
    curl \
    tar \
    xz \
    build-essential \
    ca-certificates \
    libffi-devel \
    bzip2-devel \
    openssl-devel \
    zlib-devel \
    sudo \
    git \
    azure-cli \
    unixodbc-devel \
    nginx \
    nodejs \
    npm \
    jq \
    procps-ng \
    python3-pip \
    vim

RUN npm install -g pm2

RUN ln -s /usr/bin/python3.9 /usr/bin/python

RUN ACCEPT_EULA=Y tdnf install -y msodbcsql18

RUN groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    usermod -aG sudo $USERNAME && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN curl -fsSL https://aka.ms/install-azd.sh | bash

RUN curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && \
    tdnf install -y yarn && \
    tdnf clean all

RUN mkdir -p /opt/miniconda && \
    chown -R $USERNAME:$USERNAME /opt/miniconda && \
    chown -R $USERNAME:$USERNAME /app

# SSH setup
RUN mkdir -p /var/run/sshd && \
    chmod 600 /etc/ssh/sshd_config && \
    echo "root:Docker!" | chpasswd && \
    cd /etc/ssh && \
    ssh-keygen -A

RUN echo '$USERNAME ALL=(ALL) NOPASSWD: /usr/sbin/sshd' >> /etc/sudoers

USER $USERNAME
WORKDIR /home/$USERNAME

# Download and install Miniconda
RUN curl -Lo miniconda.sh https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
    sh miniconda.sh -b -u -p /opt/miniconda && \
    rm miniconda.sh

# Update PATH
RUN echo "PATH=/app/setup/foodvibes/:\$PATH" >> ~/.bashrc

# Initialize Conda
RUN /opt/miniconda/bin/conda init bash && \
    echo ". /opt/miniconda/etc/profile.d/conda.sh" >> ~/.bashrc

# Create a new Conda environment
RUN source ~/.bashrc && conda env create -f /app/resources/envs/env.yaml && \
    echo "conda activate foodvibes-all-in-one" >> ~/.bashrc

# Activate the Conda environment and install vibe-core package
RUN source ~/.bashrc && conda activate foodvibes-all-in-one && \
    pip install --no-deps "git+https://github.com/microsoft/farmvibes-ai.git#egg=vibe_core&subdirectory=src/vibe_core"

# Enable SSH for debugging
EXPOSE 3000 7478 2222 31108

USER root

# Update PATH for root
RUN echo "PATH=/app/setup/foodvibes/:\$PATH" >> ~/.bashrc

CMD ["sleep", "infinity"]
