# STS
This repository is to maintain the code for Suntrion Teleradiology Software

## Things of Required Environments
        Python 3.90 , Node.js 18.20.3 , Postgresql 16.3, Django 


# How to setup the repository?
# Setup virtual Environment
From your command prompt,

#### Create the virtual Environment
        python -m venv EnvironmentName
#### Activate the Environment
        EnvironmentName\Scripts\activate.bat

### Install the required package for the backend
        pip install -r requirements.txt
### Database migrations
        py manage.py makemigrations
        py manage.py migrate
  
### Run the server
        py manage.py runserver




