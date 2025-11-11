<?php
// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";
//Middleware
require_once "middleware/AuthMiddleware.php";

/***--- Agregar todos los modelos*/
require_once "models/UsuarioModel.php";
require_once "models/TicketModel.php";
require_once "models/AsignacionModel.php";
require_once "models/TecnicoModel.php";
require_once "models/CategoriaModel.php";
require_once "models/PrioridadModel.php";  
require_once "models/EtiquetaModel.php";
    
// Controladores
require_once "controllers/UsuarioController.php";
require_once "controllers/TicketController.php";
require_once "controllers/AsignacionController.php";
require_once "controllers/TecnicoController.php";
require_once "controllers/CategoriaController.php";
require_once "controllers/PrioridadController.php";
require_once "controllers/EtiquetaController.php";
//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();



