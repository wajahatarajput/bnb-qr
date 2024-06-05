#!/bin/bash

# Array containing project directories
projects=("bnb-admin-dashboard" "bnb-student-registration-portal" "qr-admin-server" "bnb-teachers-portal")

# Function to install dependencies for each project
install_dependencies() {
  local project_dir="$1"
  echo "Installing dependencies for $project_dir..."
  cd "$project_dir" || return
  npm install
  cd ..
}

# Loop through each project directory and install dependencies
for project in "${projects[@]}"; do
  install_dependencies "$project"
done
