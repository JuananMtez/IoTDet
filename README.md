<!-- PROJECT LOGO -->
<br/>
<div align="center">
<a href="https://github.com/JuananMtez/NeuronLab">
    <img src="https://raw.githubusercontent.com/JuananMtez/IoTDet/main/img/IoTDetLogo.png" alt="IoTDet" width="300" height="350">

  </a>
  <h3 align="center">NeuronLab Framework</h3>
  <p align="center">
    Framework for IoT scenario management and malware detection
  </p>
</div>

## About the project
<a href="https://um.es">
  <img src="https://sceps.es/wp-content/uploads/2017/08/Logo-UMU.jpg" alt="BCI" width="195" height="50">
</a>
<br/>

This project involves developing a web application for creating and managing two types of scenarios involving IoT devices: recording scenarios for data capture and labeling, including malware interaction, and monitoring scenarios for real-time infection detection using ML/DL models. The application also supports data analysis, feature extraction, model evaluation, and integrates with Mender for device management and script deployment.


# IoTDet-GUI

### Built With
![React.js]

## Getting Started

### Prerequisites
* Node.js >= v18.14.2.


### Installation
1. Clone the repo.
```sh
git clone https://github.com/JuananMtez/IoTDet.git
```

2. Change to project directory.
```sh
cd IoTDet/IoTDet-GUI
```

3. Install NPM packages.
```shell
npm install
```

5. Modify properties in ```./src/properties.js```.
```js
export const properties = {
    url_server: 'TO BE DEFINED',
    port: 'TO BE DEFINED',
    protocol: 'TO BE DEFINED'
};
```


| parameter                    |   Description   |
|:-----------------------------|:---------------:|
| url_server                   | 	Domain where IoTDet-Backend is deployed
| port	                        |  	Port where IoTDet-Backend is deployed
| protocol 	                   |     Protocol (https or http)

## Usage

Run IoTDet-GUI in the development mode.
```shell
npm run dev
```

# IoTDet-Backend

## Built With
![python] ![FastAPI]

## Getting Started

### Prerequisites
* Python 3.10
* MySQL 


### Installation
1. Clone the repo.
```sh
git clone https://github.com/JuananMtez/IoTDet.git
```

2. Change to project directory.
```sh
cd IoTDet/IoTDet-Backend
```

4. Install dependencies.
```shell
pip install -r requirements.txt
```

5. Create database in MySQL.

6. Modify properties in ```./config/properties.ini``` .
```ini
[DATABASE]
user = TO BE DEFINED
password = TO BE DEFINED
host = TO BE DEFINED
database = TO BE DEFINED

[SECURITY]
secret_key = TO BE DEFINED
algorithm = TO BE DEFINED
access_token_expire_minute = TO BE DEFINED
```

| parameter                    |   Description   |
|:-----------------------------|:---------------:|
| user                         | 	MySQL user 
| password	                    |  	MySQL password 
| host 	                       |       	MySQL host       
| database 	                   |       	MySQL database         
| secret_key 	                 |       	Key used to sign the JWT tokens       
| algorithm 	                  |      	Algorithm used to sign the JWT token   
| access_token_expire_minute 	 |       	Token lifetime in minutes
 	        



## Usage

Run NeuronLab-Backend.
```shell
python3 -m uvicorn main:app
```

The tables will be created in the database automatically.




## Author

* **Juan Antonio Martínez López** - [Website](https://juananmtez.github.io/) - [LinkedIn](https://www.linkedin.com/in/juanantonio-martinez/)


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[Python]: https://img.shields.io/badge/Python-20232A?style=for-the-badge&logo=python
[FastAPI]: https://img.shields.io/badge/fastapi-20232A?style=for-the-badge&logo=fastapi
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react
