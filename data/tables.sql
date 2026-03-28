use survey;
/*
drop table if exists user_login_history;
drop table if exists votes;
drop table if exists temp_votes;
drop table if exists user_login_history;
drop table if exists refresh_token_tbl;
drop table if exists password_reset_tokens;
drop table if exists password_archive_tbl;
drop table if exists otc_tbl;
drop table if exists contact_tbl;
drop table if exists log_tbl;
drop table if exists survey_parties;
drop table if exists party;
drop table if exists surveys;
drop table if exists user;
*/

CREATE TABLE `contact_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `log_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `context` text,
  `timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE if not exists `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guid` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` varchar(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `major` varchar(255) DEFAULT NULL,
  `is_email_verified` tinyint NOT NULL DEFAULT '0',
  `verification_code` varchar(255) DEFAULT NULL,
  `verification_code_expiry` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '1',
  `uguid` varchar(255) NOT NULL,
  `role_id` int DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `last_login` datetime DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2b565172be4fb01f116aabffd7` (`uguid`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  KEY `FK_fb2e442d14add3cefbdf33c4561` (`role_id`),
  CONSTRAINT `FK_fb2e442d14add3cefbdf33c4561` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_login_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userGuid` varchar(255) NOT NULL,
  `loginTime` timestamp NOT NULL,
  `logoutTime` timestamp NULL DEFAULT NULL,
  `ipAddress` varchar(50) NOT NULL,
  `userAgent` varchar(255) DEFAULT NULL,
  `deviceType` enum('desktop','mobile','tablet') NOT NULL DEFAULT 'desktop',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8cd045e34dacf6e82ac34e783b5` (`userId`),
  CONSTRAINT `FK_8cd045e34dacf6e82ac34e783b5` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `otc_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uguid` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `is_active` int NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `expiry_datetime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `password_archive_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `user_id` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_1f647e94f0ec9a96514824387ef` (`userId`),
  CONSTRAINT `FK_1f647e94f0ec9a96514824387ef` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `refresh_token_tbl` (
  `id` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `isRevoked` tinyint NOT NULL DEFAULT '0',
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_84f9aa7fc0af0f2b77c3b5aa8ba` (`userId`),
  CONSTRAINT `FK_84f9aa7fc0af0f2b77c3b5aa8ba` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `party` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT '#000000',
  `leader_name` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_c0eb8cdcaaae44dae7538677080` (`created_by`),
  CONSTRAINT `FK_c0eb8cdcaaae44dae7538677080` FOREIGN KEY (`created_by`) REFERENCES `user` (`uguid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `surveys` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `total_votes` int NOT NULL DEFAULT '0',
  `status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_anonymous` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_b395d649c64d92997cb33f4d572` (`created_by`),
  CONSTRAINT `FK_b395d649c64d92997cb33f4d572` FOREIGN KEY (`created_by`) REFERENCES `user` (`uguid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `survey_parties` (
  `id` varchar(255) NOT NULL,
  `survey_id` varchar(255) DEFAULT NULL,
  `party_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9298f1694923ab599f190786fac` (`survey_id`),
  KEY `FK_15187d9b2f956d3e09ce3a6795a` (`party_id`),
  CONSTRAINT `FK_15187d9b2f956d3e09ce3a6795a` FOREIGN KEY (`party_id`) REFERENCES `party` (`id`),
  CONSTRAINT `FK_9298f1694923ab599f190786fac` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `temp_votes` (
  `id` varchar(255) NOT NULL,
  `voter_email` varchar(255) NOT NULL,
  `verification_code` varchar(6) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `expires_at` datetime NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `survey_id` varchar(255) NOT NULL,
  `party_id` varchar(255) NOT NULL,
  `verified` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_dd3c6ee433444aea317c5180c55` (`survey_id`),
  KEY `FK_770abdaec112498d6b73d1398c6` (`party_id`),
  CONSTRAINT `FK_770abdaec112498d6b73d1398c6` FOREIGN KEY (`party_id`) REFERENCES `party` (`id`),
  CONSTRAINT `FK_dd3c6ee433444aea317c5180c55` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `votes` (
  `id` varchar(255) NOT NULL,
  `voter_email` varchar(255) NOT NULL,
  `voted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `survey_id` varchar(255) DEFAULT NULL,
  `party_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_6f0d31fcfd3fb4f84d23848db28` (`survey_id`),
  KEY `FK_7d9d218e4d6defab183fbd069d3` (`party_id`),
  CONSTRAINT `FK_6f0d31fcfd3fb4f84d23848db28` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`),
  CONSTRAINT `FK_7d9d218e4d6defab183fbd069d3` FOREIGN KEY (`party_id`) REFERENCES `party` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `password_reset_tokens` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otpHash` varchar(255) NOT NULL,
  `resetToken` varchar(255) DEFAULT NULL,
  `expiresAt` timestamp NOT NULL,
  `used` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_2ecfa961f2f3e33fff8e19b6c7` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


