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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones`
--

LOCK TABLES `asignaciones` WRITE;
/*!40000 ALTER TABLE `asignaciones` DISABLE KEYS */;
INSERT INTO `asignaciones` VALUES (11,1,NULL,2,'2025-10-13 09:00:00','Automatica',NULL,NULL,1),(12,2,NULL,2,'2025-10-13 15:00:00','Manual',NULL,NULL,1),(13,3,NULL,2,'2025-10-14 10:30:00','Automatica',NULL,NULL,1),(14,4,NULL,2,'2025-10-15 14:00:00','Manual',NULL,NULL,1),(15,8,NULL,2,'2025-10-16 08:30:00','Automatica',NULL,NULL,1),(17,10,NULL,3,'2025-10-15 00:46:52','Manual',NULL,NULL,1);
/*!40000 ALTER TABLE `asignaciones` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estados`
--

LOCK TABLES `historial_estados` WRITE;
/*!40000 ALTER TABLE `historial_estados` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes_estado`
--

LOCK TABLES `imagenes_estado` WRITE;
/*!40000 ALTER TABLE `imagenes_estado` DISABLE KEYS */;
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
  `remitente_id` int(11) DEFAULT NULL,
  `destinatario_id` int(11) NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `estado` enum('pendiente','atendida') NOT NULL DEFAULT 'pendiente',
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_notif_remitente` (`remitente_id`),
  KEY `fk_notif_dest` (`destinatario_id`),
  CONSTRAINT `fk_notif_dest` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_notif_remitente` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
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
INSERT INTO `tecnico_especialidad` VALUES (7,2),(8,2),(10,2),(1,3),(2,3),(4,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'Error al abrir ERP','El ERP lanza excepción al iniciar','2025-10-09 16:02:53',3,1,4,1,NULL,'2025-10-09 18:02:53','2025-10-10 16:02:53',NULL,NULL,NULL,'2025-10-09 16:02:53','2025-10-09 16:02:53'),(2,'Laptop no enciende','Equipo sin respuesta, posible falla de energía','2025-10-09 16:02:53',2,2,4,2,NULL,'2025-10-09 19:02:53','2025-10-11 16:02:53',NULL,NULL,NULL,'2025-10-09 16:02:53','2025-10-15 00:30:27'),(3,'VPN caída','Usuarios no logran conectar a la VPN','2025-10-09 16:02:53',3,3,4,3,NULL,'2025-10-09 17:02:53','2025-10-10 04:02:53',NULL,NULL,NULL,'2025-10-09 16:02:53','2025-10-15 00:30:27'),(4,'Alerta de phishing','Correo sospechoso reportado por varios usuarios','2025-10-09 16:02:53',2,4,4,4,NULL,'2025-10-09 17:02:53','2025-10-10 00:02:53',NULL,NULL,NULL,'2025-10-09 16:02:53','2025-10-15 00:30:27'),(5,'Ticket Cerrado Demo','Para ejemplo calendario','2025-10-15 00:30:27',2,5,4,1,NULL,'2025-10-15 02:30:27','2025-10-16 00:30:27',NULL,NULL,NULL,'2025-10-15 00:30:27','2025-10-15 00:30:27'),(6,'Ticket Cerrado Demo','Para ejemplo calendario','2025-10-15 00:34:27',2,5,4,1,NULL,'2025-10-15 02:34:27','2025-10-16 00:34:27',NULL,NULL,NULL,'2025-10-15 00:34:27','2025-10-15 00:34:27'),(7,'Ticket Cerrado Demo','Para ejemplo calendario','2025-10-15 00:35:53',2,5,4,1,NULL,'2025-10-15 02:35:53','2025-10-16 00:35:53',NULL,NULL,NULL,'2025-10-15 00:35:53','2025-10-15 00:35:53'),(8,'Ticket Cerrado Demo','Para ejemplo calendario','2025-10-15 00:38:34',2,5,4,1,NULL,'2025-10-15 02:38:34','2025-10-16 00:38:34',NULL,NULL,NULL,'2025-10-15 00:38:34','2025-10-15 00:38:34'),(9,'Ticket de otro cliente','Caso 403 para cliente 1','2025-10-15 00:42:30',2,1,5,1,NULL,'2025-10-15 02:42:30','2025-10-16 00:42:30',NULL,NULL,NULL,'2025-10-15 00:42:30','2025-10-15 00:42:30'),(10,'Ticket de otro cliente','Caso 403 para cliente 1','2025-10-15 00:46:52',2,1,5,1,NULL,'2025-10-15 02:46:52','2025-10-16 00:46:52',NULL,NULL,NULL,'2025-10-15 00:46:52','2025-10-15 00:46:52');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

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
  `disponibilidad` enum('Disponible','NoDisponible','EnDescanso') DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@fixit.cr','1234','Admin','FixIT',NULL,1,NULL,NULL,NULL,NULL,1,'2025-10-09 16:02:53','2025-10-15 11:46:33'),(2,'jesibajaca@est.utn.ac.cr','1234','Jesús Darián','Sibaja Cascante','84086025',2,'Disponible','Técnico líder',NULL,NULL,1,'2025-10-09 16:02:53','2025-10-15 11:46:33'),(3,'kemoscosomi@est.utn.ac.cr','1234','Keity Paola','Moscoso Miranda','63299589',2,'Disponible','Soporte N2',NULL,NULL,1,'2025-10-09 16:02:53','2025-10-15 11:46:33'),(4,'cliente1@fixit.cr','1234','Usuario','Cliente',NULL,3,NULL,NULL,NULL,NULL,1,'2025-10-09 16:02:53','2025-10-15 11:46:33'),(5,'cliente2@fixit.cr','1234','Cliente','Dos',NULL,3,NULL,NULL,NULL,NULL,1,'2025-10-15 00:42:30','2025-10-15 11:46:33');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valoraciones`
--

LOCK TABLES `valoraciones` WRITE;
/*!40000 ALTER TABLE `valoraciones` DISABLE KEYS */;
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
-- Temporary view structure for view `vw_puntaje_ticket`
--

DROP TABLE IF EXISTS `vw_puntaje_ticket`;
/*!50001 DROP VIEW IF EXISTS `vw_puntaje_ticket`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_puntaje_ticket` AS SELECT 
 1 AS `ticket_id`,
 1 AS `prioridad`,
 1 AS `horas_restantes_sla`,
 1 AS `puntaje`*/;
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

--
-- Final view structure for view `vw_puntaje_ticket`
--

/*!50001 DROP VIEW IF EXISTS `vw_puntaje_ticket`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_puntaje_ticket` AS select `tk`.`id` AS `ticket_id`,`pr`.`id` AS `prioridad`,`horas_restantes_resolucion`(`tk`.`id`) AS `horas_restantes_sla`,`pr`.`id` * 1000 - coalesce(`horas_restantes_resolucion`(`tk`.`id`),0) AS `puntaje` from (`tickets` `tk` join `prioridades` `pr` on(`pr`.`id` = `tk`.`prioridad_id`)) */;
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

-- Dump completed on 2025-10-15 13:26:57
