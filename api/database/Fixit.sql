-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fixit
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asignaciones`
--

DROP TABLE IF EXISTS `asignaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `tecnico_usuario_id` bigint(20) DEFAULT NULL,
  `tecnico_id` int(11) NOT NULL,
  `fecha_asignacion` datetime NOT NULL DEFAULT current_timestamp(),
  `metodo` enum('Automatica','Manual') NOT NULL,
  `regla_aplicada_id` int(11) DEFAULT NULL,
  `puntaje_prioridad` decimal(10,2) DEFAULT NULL,
  `vigente` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_asig_regla` (`regla_aplicada_id`),
  KEY `ix_asig_vigente` (`ticket_id`,`vigente`),
  KEY `fk_asig_tecnico_usuario` (`tecnico_id`),
  CONSTRAINT `fk_asig_regla` FOREIGN KEY (`regla_aplicada_id`) REFERENCES `reglas_autotriage` (`id`),
  CONSTRAINT `fk_asig_tecnico_usuario` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_asig_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones`
--

LOCK TABLES `asignaciones` WRITE;
/*!40000 ALTER TABLE `asignaciones` DISABLE KEYS */;
INSERT INTO `asignaciones` VALUES (100,100,2,2,'2025-10-27 09:00:00','Automatica',1,NULL,1),(101,101,2,2,'2025-10-28 09:30:00','Manual',2,NULL,1),(102,102,2,2,'2025-10-29 10:30:00','Automatica',3,NULL,1),(103,103,3,3,'2025-10-29 11:15:00','Automatica',4,NULL,1),(104,104,2,2,'2025-10-31 08:15:00','Manual',1,NULL,0),(105,105,2,2,'2025-10-30 09:15:00','Automatica',3,NULL,1),(106,106,2,2,'2025-10-30 09:20:00','Automatica',3,NULL,1),(107,100,NULL,11,'2025-12-01 17:01:31','Automatica',1,2824.00,1),(113,115,NULL,11,'2025-12-05 00:14:03','Manual',NULL,NULL,1),(114,116,NULL,8,'2025-12-05 00:28:40','Manual',NULL,NULL,1);
/*!40000 ALTER TABLE `asignaciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_aumentar_carga_trabajo
AFTER INSERT ON asignaciones
FOR EACH ROW
BEGIN
  UPDATE usuarios
  SET carga_trabajo = COALESCE(carga_trabajo, 0) + 1
  WHERE id = NEW.tecnico_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_disminuir_carga_trabajo
AFTER UPDATE ON asignaciones
FOR EACH ROW
BEGIN
  -- Solo ejecuta si el campo vigente pasó de 1 a 0
  IF OLD.vigente = 1 AND NEW.vigente = 0 THEN
    UPDATE usuarios
    SET carga_trabajo = GREATEST(COALESCE(carga_trabajo, 0) - 1, 0)
    WHERE id = NEW.tecnico_id;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_disminuir_carga_trabajo_delete
AFTER DELETE ON asignaciones
FOR EACH ROW
BEGIN
  -- Cuando se elimina una asignación, reducimos la carga del técnico
  UPDATE usuarios
  SET carga_trabajo = GREATEST(COALESCE(carga_trabajo, 0) - 1, 0)
  WHERE id = OLD.tecnico_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `categoria_especialidad`
--

DROP TABLE IF EXISTS `categoria_especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_especialidad` (
  `categoria_id` int(11) NOT NULL,
  `especialidad_id` int(11) NOT NULL,
  PRIMARY KEY (`categoria_id`,`especialidad_id`),
  KEY `fk_catesp_esp` (`especialidad_id`),
  CONSTRAINT `fk_catesp_cat` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_catesp_esp` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_especialidad`
--

LOCK TABLES `categoria_especialidad` WRITE;
/*!40000 ALTER TABLE `categoria_especialidad` DISABLE KEYS */;
INSERT INTO `categoria_especialidad` VALUES (1,1),(1,2),(1,3),(2,4),(2,5),(2,6),(3,7),(3,8),(3,9),(4,10),(4,11),(4,12);
/*!40000 ALTER TABLE `categoria_especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_etiqueta`
--

DROP TABLE IF EXISTS `categoria_etiqueta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_etiqueta` (
  `categoria_id` int(11) NOT NULL,
  `etiqueta_id` int(11) NOT NULL,
  PRIMARY KEY (`categoria_id`,`etiqueta_id`),
  KEY `fk_catet_tag` (`etiqueta_id`),
  CONSTRAINT `fk_catet_cat` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_catet_tag` FOREIGN KEY (`etiqueta_id`) REFERENCES `etiquetas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_etiqueta`
--

LOCK TABLES `categoria_etiqueta` WRITE;
/*!40000 ALTER TABLE `categoria_etiqueta` DISABLE KEYS */;
INSERT INTO `categoria_etiqueta` VALUES (1,1),(1,2),(1,3),(1,4),(2,5),(2,6),(2,7),(2,8),(3,9),(3,10),(3,11),(3,12),(4,13),(4,14),(4,15),(4,16);
/*!40000 ALTER TABLE `categoria_etiqueta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `sla_id` int(11) NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_categoria_sla` (`sla_id`),
  CONSTRAINT `fk_categoria_sla` FOREIGN KEY (`sla_id`) REFERENCES `sla` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Soporte de Software','Instalación, actualización, errores de app, licenciamiento',1,'2025-10-09 16:02:53','2025-10-09 16:02:53'),(2,'Soporte de Hardware','Equipos, impresoras, periféricos, fallas físicas',2,'2025-10-09 16:02:53','2025-10-09 16:02:53'),(3,'Redes y Conectividad','Internet, WiFi, VPN, cableado estructurado',3,'2025-10-09 16:02:53','2025-10-09 16:02:53'),(4,'Seguridad Informática','Antivirus, firewall, phishing, accesos no autorizados',4,'2025-10-09 16:02:53','2025-10-09 16:02:53');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
INSERT INTO `especialidades` VALUES (1,'Ingeniero de software','Desarrollo y soporte de aplicaciones'),(2,'Soporte de aplicaciones','Atención y mantenimiento de apps'),(3,'Administrador de licencias','Gestión y cumplimiento de licencias'),(4,'Técnico en hardware','Reparación y mantenimiento de equipos'),(5,'Soporte de dispositivos','Soporte a periféricos y equipos'),(6,'Mantenimiento preventivo','Planificación y ejecución de mantenimiento'),(7,'Ingeniero de redes','Diseño y operación de redes'),(8,'Soporte de conectividad','Atención de incidentes de conectividad'),(9,'Administrador de telecomunicaciones','Gestión de infraestructura de telecom'),(10,'Analista de seguridad','Monitoreo y respuesta a eventos'),(11,'Administrador de sistemas','Gestión de sistemas con enfoque seguridad'),(12,'Especialista en ciberseguridad','Arquitectura y hardening de seguridad');
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_ticket`
--

DROP TABLE IF EXISTS `estados_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_ticket` (
  `id` tinyint(4) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `orden` smallint(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_ticket`
--

LOCK TABLES `estados_ticket` WRITE;
/*!40000 ALTER TABLE `estados_ticket` DISABLE KEYS */;
INSERT INTO `estados_ticket` VALUES (1,'Pendiente',1),(2,'Asignado',2),(3,'En Proceso',3),(4,'Resuelto',4),(5,'Cerrado',5);
/*!40000 ALTER TABLE `estados_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etiquetas`
--

DROP TABLE IF EXISTS `etiquetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etiquetas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etiquetas`
--

LOCK TABLES `etiquetas` WRITE;
/*!40000 ALTER TABLE `etiquetas` DISABLE KEYS */;
INSERT INTO `etiquetas` VALUES (16,'Accesos no autorizados'),(2,'Actualización'),(13,'Antivirus'),(12,'Cableado estructurado'),(5,'Equipos de cómputo'),(3,'Error de aplicación'),(8,'Fallas físicas'),(14,'Firewall'),(6,'Impresoras'),(1,'Instalación'),(9,'Internet'),(4,'Licenciamiento'),(7,'Periféricos'),(15,'Phishing'),(11,'VPN'),(10,'WiFi');
/*!40000 ALTER TABLE `etiquetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_estados`
--

DROP TABLE IF EXISTS `historial_estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `estado_id` tinyint(4) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `usuario_id` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_hist_ticket` (`ticket_id`),
  KEY `fk_hist_estado` (`estado_id`),
  KEY `fk_hist_usuario` (`usuario_id`),
  CONSTRAINT `fk_hist_estado` FOREIGN KEY (`estado_id`) REFERENCES `estados_ticket` (`id`),
  CONSTRAINT `fk_hist_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  CONSTRAINT `fk_hist_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estados`
--

LOCK TABLES `historial_estados` WRITE;
/*!40000 ALTER TABLE `historial_estados` DISABLE KEYS */;
INSERT INTO `historial_estados` VALUES (4,100,1,'2025-10-21 09:15:00',4,'Creación del ticket'),(5,100,2,'2025-10-21 09:30:00',2,'Asignado al técnico hardware'),(6,100,3,'2025-10-21 10:00:00',2,'Cambio de cartucho y revisión de cola de impresión'),(7,100,4,'2025-10-21 11:00:00',2,'Impresora operativa'),(8,100,5,'2025-10-21 11:30:00',4,'Cliente confirma solución'),(9,101,1,'2025-10-22 10:00:00',4,'Ticket creado'),(10,101,2,'2025-10-22 10:20:00',3,'Asignado manualmente'),(11,101,3,'2025-10-22 11:00:00',3,'Revisión de consultas SQL lentas'),(12,101,4,'2025-10-22 12:00:00',3,'Optimización de índices'),(13,101,5,'2025-10-22 12:30:00',4,'Cliente confirma rendimiento correcto'),(14,102,1,'2025-10-23 08:40:00',4,'Ticket creado'),(15,102,2,'2025-10-23 09:00:00',2,'Asignado a soporte de red'),(16,102,3,'2025-10-23 09:30:00',2,'Reinicio de servidor Exchange'),(17,102,4,'2025-10-23 10:15:00',2,'Correo restablecido'),(18,102,5,'2025-10-23 10:45:00',4,'Cliente satisfecho'),(19,101,2,'2025-10-30 14:08:10',1,'se ve azul ajunto imagen'),(20,104,4,'2025-10-30 21:00:28',1,'Ya estaba disponible la actualizacion'),(21,104,5,'2025-10-30 21:00:39',1,''),(22,104,5,'2025-10-30 21:00:40',1,''),(23,100,2,'2025-12-01 17:01:31',11,'Asignación automática basada en R-Software'),(24,102,4,'2025-12-02 01:38:04',2,'aaaaa'),(25,105,4,'2025-12-02 01:38:33',2,'todo en orden'),(26,106,3,'2025-12-02 16:24:10',2,'Va mejoradno'),(27,106,4,'2025-12-02 16:26:50',1,'\"El técnico aceptó el ticket\"'),(28,106,5,'2025-12-02 16:29:46',2,'Cerrado'),(29,100,3,'2025-12-02 16:30:58',1,'\"El técnico aceptó el ticket\"'),(30,100,4,'2025-12-02 16:36:42',2,'Resuelto por completo'),(31,101,3,'2025-12-02 16:45:04',2,'Proceso de recuperacion'),(32,101,4,'2025-12-02 16:57:18',2,'Resuelto'),(33,100,5,'2025-12-02 17:05:09',2,'cerrado'),(34,101,5,'2025-12-02 17:06:18',2,'cerrado'),(35,102,5,'2025-12-02 17:08:22',2,'cerrado'),(36,105,5,'2025-12-02 19:58:44',2,'mejorando'),(47,115,2,'2025-12-05 00:14:03',11,'Asignación manual'),(48,115,3,'2025-12-05 00:18:09',1,''),(49,116,2,'2025-12-05 00:28:40',8,'Asignación manual'),(50,116,3,'2025-12-05 00:29:08',1,'j'),(51,103,5,'2025-12-05 00:32:04',3,''),(52,116,4,'2025-12-05 00:32:45',1,'');
/*!40000 ALTER TABLE `historial_estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagenes_estado`
--

DROP TABLE IF EXISTS `imagenes_estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenes_estado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `historial_id` int(11) NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_img_hist` (`historial_id`),
  CONSTRAINT `fk_img_hist` FOREIGN KEY (`historial_id`) REFERENCES `historial_estados` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes_estado`
--

LOCK TABLES `imagenes_estado` WRITE;
/*!40000 ALTER TABLE `imagenes_estado` DISABLE KEYS */;
INSERT INTO `imagenes_estado` VALUES (20,19,'uploads/estados/1761854890_1ad9dda8-614a-45e6-9bff-f06757713c9f.png','Evidencia del cambio de estado'),(21,20,'uploads/estados/1761879628_imagen_2025-10-30_210002010.png','Evidencia del cambio de estado'),(22,24,'uploads/estados/1764661084_Captura_de_pantalla_2025-04-20_230627.png','Evidencia del cambio de estado'),(23,25,'uploads/estados/1764661113_Captura_de_pantalla_2025-04-28_005333.png','Evidencia del cambio de estado'),(24,26,'uploads/estados/1764714250_Captura_de_pantalla_2025-04-28_003513.png','Evidencia del cambio de estado'),(25,28,'uploads/estados/1764714586_Captura_de_pantalla_2025-04-28_004318.png','Evidencia del cambio de estado'),(26,30,'uploads/estados/1764715002_Captura_de_pantalla_2025-04-28_005333.png','Evidencia del cambio de estado'),(27,31,'uploads/estados/1764715504_Captura_de_pantalla_2025-04-28_004552.png','Evidencia del cambio de estado'),(28,32,'uploads/estados/1764716238_Captura_de_pantalla_2025-04-28_162727.png','Evidencia del cambio de estado'),(29,33,'uploads/estados/1764716709_Captura_de_pantalla_2025-04-28_003513.png','Evidencia del cambio de estado'),(30,34,'uploads/estados/1764716778_Captura_de_pantalla_2025-04-28_005229.png','Evidencia del cambio de estado'),(31,35,'uploads/estados/1764716902_Captura_de_pantalla_2025-04-28_005333.png','Evidencia del cambio de estado'),(32,36,'uploads/estados/1764727124_Captura_de_pantalla_2025-04-28_154007.png','Evidencia del cambio de estado'),(38,50,'uploads/estados/1764916148_Screenshot_2025-05-23_194450.png','Evidencia del cambio de estado');
/*!40000 ALTER TABLE `imagenes_estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(60) NOT NULL,
  `referencia_ticket` int(11) DEFAULT NULL,
  `remitente_id` int(11) DEFAULT NULL,
  `destinatario_id` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `estado` enum('no_leida','leida') NOT NULL DEFAULT 'no_leida',
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_notif_remitente` (`remitente_id`),
  KEY `fk_notif_dest` (`destinatario_id`),
  CONSTRAINT `fk_notif_dest` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_notif_remitente` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,'cambio_estado',13,1,5,'El ticket #13 cambió a Asignado','leida','2025-12-01 23:56:07'),(2,'login',NULL,1,5,'El usuario Ana inició sesión','leida','2025-12-02 00:04:28'),(3,'login',NULL,NULL,5,'El usuario Cliente inició sesión','leida','2025-12-02 01:25:25'),(4,'login',NULL,NULL,1,'El usuario Admin inició sesión','leida','2025-12-02 01:25:56'),(5,'login',NULL,NULL,1,'El usuario Admin inició sesión','leida','2025-12-02 01:35:58'),(6,'login',NULL,NULL,2,'El usuario Jesús Darián inició sesión','leida','2025-12-02 01:37:11'),(7,'login',NULL,NULL,2,'El usuario Jesús Darián inició sesión','leida','2025-12-02 16:16:14'),(8,'login',NULL,NULL,2,'El usuario Jesús Darián inició sesión','leida','2025-12-02 16:29:15'),(9,'cambio_estado',106,2,2,'El ticket #106 cambió a Cerrado','leida','2025-12-02 16:29:46'),(145,'cambio_estado',116,1,8,'El ticket #116 cambió a En Proceso','no_leida','2025-12-05 00:29:08'),(146,'cambio_estado',116,1,5,'El ticket #116 cambió a En Proceso','no_leida','2025-12-05 00:29:08'),(147,'login',NULL,3,3,'El usuario Keity Paola inició sesión','no_leida','2025-12-05 00:31:49'),(148,'cambio_estado',103,3,3,'El ticket #103 cambió a Cerrado','no_leida','2025-12-05 00:32:04'),(149,'cambio_estado',103,3,5,'El ticket #103 cambió a Cerrado','no_leida','2025-12-05 00:32:04'),(150,'login',NULL,1,1,'El usuario Admin inició sesión','no_leida','2025-12-05 00:32:27'),(151,'cambio_estado',116,1,8,'El ticket #116 cambió a Resuelto','no_leida','2025-12-05 00:32:45'),(152,'cambio_estado',116,1,5,'El ticket #116 cambió a Resuelto','no_leida','2025-12-05 00:32:45'),(153,'login',NULL,1,1,'El usuario Admin inició sesión','no_leida','2025-12-05 00:46:27'),(154,'login',NULL,1,1,'El usuario Admin inició sesión','no_leida','2025-12-05 01:55:56'),(155,'login',NULL,1,1,'El usuario Admin inició sesión','no_leida','2025-12-05 02:07:56'),(156,'login',NULL,4,4,'El usuario Usuario inició sesión','no_leida','2025-12-05 02:10:37');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prioridades`
--

DROP TABLE IF EXISTS `prioridades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prioridades` (
  `id` tinyint(4) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prioridades`
--

LOCK TABLES `prioridades` WRITE;
/*!40000 ALTER TABLE `prioridades` DISABLE KEYS */;
INSERT INTO `prioridades` VALUES (3,'Alta'),(1,'Baja'),(2,'Media');
/*!40000 ALTER TABLE `prioridades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reglas_autotriage`
--

DROP TABLE IF EXISTS `reglas_autotriage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reglas_autotriage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `prioridad_min` tinyint(4) DEFAULT NULL,
  `prioridad_max` tinyint(4) DEFAULT NULL,
  `especialidad_id` int(11) DEFAULT NULL,
  `peso_carga_tecnico` int(11) NOT NULL DEFAULT 1,
  `orden_prioridad` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_rtriage_categoria` (`categoria_id`),
  KEY `fk_rtriage_esp` (`especialidad_id`),
  CONSTRAINT `fk_rtriage_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_rtriage_esp` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reglas_autotriage`
--

LOCK TABLES `reglas_autotriage` WRITE;
/*!40000 ALTER TABLE `reglas_autotriage` DISABLE KEYS */;
INSERT INTO `reglas_autotriage` VALUES (1,'R-Software',1,1,3,2,2,1,1,'2025-10-09 16:02:53','2025-10-09 16:02:53'),(2,'R-Hardware',2,1,3,4,3,2,1,'2025-10-09 16:02:53','2025-10-09 16:02:53'),(3,'R-Redes',3,1,3,8,1,1,1,'2025-10-09 16:02:53','2025-10-09 16:02:53'),(4,'R-Seguridad',4,2,3,10,1,1,1,'2025-10-09 16:02:53','2025-10-09 16:02:53');
/*!40000 ALTER TABLE `reglas_autotriage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` tinyint(4) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador'),(3,'Cliente'),(2,'Tecnico');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sla`
--

DROP TABLE IF EXISTS `sla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `tiempo_max_respuesta_min` int(11) NOT NULL,
  `tiempo_max_resolucion_min` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sla`
--

LOCK TABLES `sla` WRITE;
/*!40000 ALTER TABLE `sla` DISABLE KEYS */;
INSERT INTO `sla` VALUES (1,'SLA Software',120,1440,1),(2,'SLA Hardware',180,2880,1),(3,'SLA Redes y Conectividad',60,720,1),(4,'SLA Seguridad Informática',60,480,1);
/*!40000 ALTER TABLE `sla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tecnico_especialidad`
--

DROP TABLE IF EXISTS `tecnico_especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tecnico_especialidad` (
  `especialidad_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  PRIMARY KEY (`usuario_id`,`especialidad_id`),
  KEY `fk_tecesp_especialidad` (`especialidad_id`),
  CONSTRAINT `fk_tecesp_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`),
  CONSTRAINT `fk_tecesp_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tecnico_especialidad`
--

LOCK TABLES `tecnico_especialidad` WRITE;
/*!40000 ALTER TABLE `tecnico_especialidad` DISABLE KEYS */;
INSERT INTO `tecnico_especialidad` VALUES (7,2),(8,2),(10,2),(1,3),(2,3),(4,3),(4,8),(5,8),(6,8),(10,9),(11,9),(12,9),(1,10),(2,10),(3,10),(2,11),(5,11),(6,11);
/*!40000 ALTER TABLE `tecnico_especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `prioridad_id` tinyint(4) NOT NULL,
  `estado_id` tinyint(4) NOT NULL,
  `usuario_solicitante_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `sla_resp_limite` datetime DEFAULT NULL,
  `sla_resol_limite` datetime DEFAULT NULL,
  `cumplio_sla_respuesta` tinyint(1) DEFAULT NULL,
  `cumplio_sla_resolucion` tinyint(1) DEFAULT NULL,
  `dias_resolucion` int(11) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ticket_usuario` (`usuario_solicitante_id`),
  KEY `ix_tickets_estado` (`estado_id`),
  KEY `ix_tickets_categoria` (`categoria_id`),
  KEY `ix_tickets_prioridad` (`prioridad_id`),
  CONSTRAINT `fk_ticket_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_ticket_estado` FOREIGN KEY (`estado_id`) REFERENCES `estados_ticket` (`id`),
  CONSTRAINT `fk_ticket_prioridad` FOREIGN KEY (`prioridad_id`) REFERENCES `prioridades` (`id`),
  CONSTRAINT `fk_ticket_usuario` FOREIGN KEY (`usuario_solicitante_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (100,'Error al iniciar sesión en ERP','Usuario reporta error 403 al intentar ingresar al ERP.','2025-10-27 08:15:00',2,5,4,1,NULL,'2025-10-27 10:15:00','2025-10-28 08:15:00',NULL,NULL,NULL,'2025-10-30 12:38:57','2025-12-02 17:05:09'),(101,'Pantalla azul en laptop Lenovo','Laptop presenta BSOD al encender, posible falla en RAM.','2025-10-28 09:00:00',3,5,4,2,NULL,'2025-10-28 12:00:00','2025-10-30 09:00:00',NULL,NULL,NULL,'2025-10-30 12:38:57','2025-12-02 17:06:18'),(102,'VPN intermitente','La conexión VPN se corta cada 5 minutos en red interna.','2025-10-29 10:00:00',2,5,4,3,NULL,'2025-10-29 11:00:00','2025-10-29 22:00:00',NULL,NULL,NULL,'2025-10-30 12:38:57','2025-12-02 17:08:22'),(103,'Correo phishing detectado','Correo sospechoso detectado en múltiples cuentas.','2025-10-29 11:00:00',1,5,5,4,'2025-10-29 16:00:00','2025-10-29 12:00:00','2025-10-29 19:00:00',1,1,0,'2025-10-30 12:38:57','2025-12-05 00:32:04'),(104,'Actualización de software completada','Se actualizó el ERP sin errores posteriores.','2025-10-31 08:00:00',1,5,5,1,'2025-11-01 09:30:00','2025-10-31 10:00:00','2025-11-01 08:00:00',1,1,1,'2025-10-30 12:38:57','2025-10-30 21:00:40'),(105,'Conexión lenta en red corporativa','El usuario reporta lentitud constante al acceder a recursos compartidos en la red interna.','2025-10-30 09:00:00',3,5,4,3,NULL,'2025-10-31 10:00:00','2025-10-31 21:00:00',1,0,NULL,'2025-10-30 23:28:40','2025-12-02 19:58:44'),(106,'Problemas intermitentes de WiFi en sala de reuniones','El usuario reporta desconexiones aleatorias al conectarse al WiFi institucional.','2025-10-30 09:00:00',2,5,4,3,NULL,'2025-10-30 10:00:00','2025-10-30 21:00:00',1,NULL,NULL,'2025-10-30 23:36:46','2025-12-02 16:29:46'),(115,'Error al actualizar Office','El usuario reporta fallo al instalar actualización acumulativa.','2025-12-04 23:17:46',2,3,4,1,NULL,'2025-12-05 01:17:46','2025-12-05 23:17:46',NULL,NULL,NULL,'2025-12-04 23:17:46','2025-12-05 00:18:09'),(116,'Pantalla de laptop con líneas horizontales','El equipo presenta líneas intermitentes en la pantalla.','2025-12-04 23:17:59',3,4,5,2,NULL,'2025-12-05 02:17:59','2025-12-06 23:17:59',NULL,NULL,NULL,'2025-12-04 23:17:59','2025-12-05 00:32:45'),(117,'WiFi se desconecta al cambiar de salón','La señal se pierde al desplazarse entre aulas.','2025-12-04 23:18:12',1,1,4,3,NULL,'2025-12-05 00:18:12','2025-12-05 11:18:12',NULL,NULL,NULL,'2025-12-04 23:18:12','2025-12-04 23:18:12'),(118,'Posible infección por malware','Comportamiento extraño detectado: ventanas emergentes y procesos desconocidos.','2025-12-04 23:18:25',3,1,5,4,NULL,'2025-12-05 00:18:25','2025-12-05 07:18:25',NULL,NULL,NULL,'2025-12-04 23:18:25','2025-12-04 23:18:25'),(119,'Licencia de ERP no válida','El usuario indica que el sistema marca la licencia como expirada.','2025-12-04 23:18:38',2,1,4,1,NULL,'2025-12-05 01:18:38','2025-12-05 23:18:38',NULL,NULL,NULL,'2025-12-04 23:18:38','2025-12-04 23:18:38'),(120,'VPN no funciona desde fuera del campus','Los usuarios remotos no logran autenticarse en la VPN.','2025-12-04 23:18:50',3,1,5,3,NULL,'2025-12-05 00:18:50','2025-12-05 11:18:50',NULL,NULL,NULL,'2025-12-04 23:18:50','2025-12-04 23:18:50'),(121,'Error al enviar correos institucionales','Los mensajes se quedan en bandeja de salida y no llegan al destinatario.','2025-12-05 02:09:14',2,1,4,2,NULL,'2025-12-05 05:09:14','2025-12-07 02:09:14',NULL,NULL,NULL,'2025-12-05 02:09:14','2025-12-05 02:09:14'),(125,'Impresora mala','Porfaaaaaaa','2025-12-05 02:11:08',3,1,4,3,NULL,'2025-12-05 03:11:08','2025-12-05 14:11:08',NULL,NULL,NULL,'2025-12-05 02:11:08','2025-12-05 02:11:08');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_ticket_ai_calc_sla
BEFORE INSERT ON tickets
FOR EACH ROW
BEGIN
  DECLARE v_resp INT DEFAULT 0;
  DECLARE v_resol INT DEFAULT 0;

  SELECT s.tiempo_max_respuesta_min, s.tiempo_max_resolucion_min
    INTO v_resp, v_resol
    FROM categorias c
    JOIN sla s ON s.id = c.sla_id
   WHERE c.id = NEW.categoria_id;

  SET NEW.sla_resp_limite = DATE_ADD(NEW.fecha_creacion, INTERVAL v_resp MINUTE);
  SET NEW.sla_resol_limite = DATE_ADD(NEW.fecha_creacion, INTERVAL v_resol MINUTE);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_ticket_au_recalc_sla
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  DECLARE v_resp INT DEFAULT 0;
  DECLARE v_resol INT DEFAULT 0;

  IF (NEW.categoria_id <> OLD.categoria_id)
     OR (NEW.fecha_creacion <> OLD.fecha_creacion) THEN

    SELECT s.tiempo_max_respuesta_min, s.tiempo_max_resolucion_min
      INTO v_resp, v_resol
      FROM categorias c
      JOIN sla s ON s.id = c.sla_id
     WHERE c.id = NEW.categoria_id;

    SET NEW.sla_resp_limite  = DATE_ADD(NEW.fecha_creacion, INTERVAL v_resp  MINUTE);
    SET NEW.sla_resol_limite = DATE_ADD(NEW.fecha_creacion, INTERVAL v_resol MINUTE);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_ticket_au_cierre
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  IF NEW.fecha_cierre IS NOT NULL
     AND (OLD.fecha_cierre IS NULL OR NEW.fecha_cierre <> OLD.fecha_cierre) THEN
    SET NEW.dias_resolucion = TIMESTAMPDIFF(DAY, NEW.fecha_creacion, NEW.fecha_cierre);
    SET NEW.cumplio_sla_respuesta = (NEW.sla_resp_limite IS NOT NULL AND NEW.sla_resp_limite >= NEW.fecha_creacion);
    SET NEW.cumplio_sla_resolucion = (NEW.sla_resol_limite IS NOT NULL AND NEW.fecha_cierre <= NEW.sla_resol_limite);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(120) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `telefono` varchar(25) DEFAULT NULL,
  `rol_id` tinyint(4) NOT NULL,
  `disponibilidad` enum('Disponible','Ocupado') DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `carga_trabajo` int(11) DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_usuarios_rol` (`rol_id`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@fixit.cr','1234','Admin','FixIT',NULL,1,NULL,NULL,0,NULL,1,'2025-10-09 16:02:53','2025-10-29 23:04:28'),(2,'jesibajaca@est.utn.ac.cr','1234','Jesús Darián','Sibaja Cascante','84086025',2,'Disponible','Técnico líder',5,NULL,1,'2025-10-09 16:02:53','2025-12-04 23:13:11'),(3,'kemoscosomi@est.utn.ac.cr','1234','Keity Paola','Moscoso Miranda','63299589',2,'Disponible','Soporte N2',2,NULL,1,'2025-10-09 16:02:53','2025-10-30 12:38:57'),(4,'cliente1@fixit.cr','1234','Usuario','Cliente',NULL,3,NULL,NULL,0,NULL,1,'2025-10-09 16:02:53','2025-10-29 23:04:28'),(5,'cliente2@fixit.cr','1234','Cliente','Dos',NULL,3,NULL,NULL,0,NULL,1,'2025-10-15 00:42:30','2025-10-29 23:04:28'),(8,'tecnico3@fixit.cr','1234','Valerie','Araya','60112233',2,'Disponible','Soporte de hardware',1,NULL,1,'2025-10-29 23:34:03','2025-12-05 00:28:40'),(9,'tecnico4@fixit.cr','1234','Sebastián','Rodriguez','72112233',2,'Ocupado','Especialista en ciberseguridad',1,NULL,1,'2025-10-29 23:34:03','2025-10-29 23:43:02'),(10,'tecnico5@fixit.cr','1234','Fiorella','Calderón','88885555',2,'Ocupado','Soporte de software',0,NULL,1,'2025-10-29 23:34:03','2025-12-04 23:13:11'),(11,'tecnico6@fixit.cr','1234','Ana','Arias','88983903',2,'Ocupado','Soporte de software',2,NULL,1,'2025-10-29 23:45:16','2025-12-05 00:14:03');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valoraciones`
--

DROP TABLE IF EXISTS `valoraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valoraciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `puntaje` tinyint(4) NOT NULL,
  `comentario` varchar(255) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_id` (`ticket_id`),
  KEY `fk_val_cliente` (`cliente_id`),
  CONSTRAINT `fk_val_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_val_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valoraciones`
--

LOCK TABLES `valoraciones` WRITE;
/*!40000 ALTER TABLE `valoraciones` DISABLE KEYS */;
INSERT INTO `valoraciones` VALUES (100,103,5,5,'Excelente atención, respuesta rápida y efectiva.','2025-10-29 18:00:00'),(101,104,5,4,'Buen servicio, aunque la actualización tomó un poco más de lo esperado.','2025-11-01 10:15:00');
/*!40000 ALTER TABLE `valoraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_carga_tecnico`
--

DROP TABLE IF EXISTS `vw_carga_tecnico`;
/*!50001 DROP VIEW IF EXISTS `vw_carga_tecnico`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_carga_tecnico` AS SELECT 
 1 AS `tecnico_id`,
 1 AS `nombre`,
 1 AS `apellido`,
 1 AS `tickets_asignados_vigentes`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_carga_tecnico`
--

/*!50001 DROP VIEW IF EXISTS `vw_carga_tecnico`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_carga_tecnico` AS select `u`.`id` AS `tecnico_id`,`u`.`nombre` AS `nombre`,`u`.`apellido` AS `apellido`,count(`a`.`id`) AS `tickets_asignados_vigentes` from (((`usuarios` `u` join `roles` `r` on(`r`.`id` = `u`.`rol_id` and `r`.`nombre` = 'Tecnico')) left join `asignaciones` `a` on(`a`.`tecnico_id` = `u`.`id` and `a`.`vigente` = 1)) left join `tickets` `tk` on(`tk`.`id` = `a`.`ticket_id` and `tk`.`estado_id` in (1,2,3))) group by `u`.`id`,`u`.`nombre`,`u`.`apellido` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-05  2:13:44
