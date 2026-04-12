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

CREATE TABLE `country` (
  `id` varchar(255) NOT NULL,
  `name` varchar(120) NOT NULL,
  `iso_code` varchar(5) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);


CREATE TABLE `party_master` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT '#000000',
  `leader_name` varchar(100) DEFAULT NULL,
  `contestant_name` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `country_id` varchar(100) DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_5d2c9f8023e5baf613dadff7f34` (`country_id`),
  CONSTRAINT `FK_5d2c9f8023e5baf613dadff7f34` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`)
); 

CREATE TABLE `party` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT '#000000',
  `leader_name` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
   `contestant_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_c0eb8cdcaaae44dae7538677080` (`created_by`),
  CONSTRAINT `FK_c0eb8cdcaaae44dae7538677080` FOREIGN KEY (`created_by`) REFERENCES `user` (`uguid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `surveys` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `total_votes` int NOT NULL DEFAULT '0',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_anonymous` tinyint NOT NULL DEFAULT '1',
  `status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
  `survey_url` varchar(255) DEFAULT NULL,
  `short_url` varchar(255) DEFAULT NULL,  
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
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


/*BLOG tables*/
CREATE TABLE `blog_posts` (
  `id` varchar(255) NOT NULL,
  `title` varchar(300) NOT NULL,
  `excerpt` text NOT NULL,
  `content_html` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `category_label` varchar(80) NOT NULL,
  `tags` text NOT NULL,
  `author_name` varchar(100) NOT NULL,
  `author_role` varchar(100) NOT NULL,
  `author_initials` varchar(4) NOT NULL,
  `author_avatar_color` varchar(20) NOT NULL,
  `like_count` int NOT NULL DEFAULT '0',
  `comment_count` int NOT NULL DEFAULT '0',
  `view_count` int NOT NULL DEFAULT '0',
  `read_time` int NOT NULL DEFAULT '5',
  `trending` tinyint NOT NULL DEFAULT '0',
  `featured` tinyint NOT NULL DEFAULT '0',
  `published` tinyint NOT NULL DEFAULT '1',
  `published_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
);

CREATE INDEX idx_blog_posts_category   ON blog_posts(category);
CREATE INDEX idx_blog_posts_published  ON blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_trending   ON blog_posts(trending, view_count DESC);
CREATE INDEX idx_blog_posts_featured   ON blog_posts(featured);
CREATE INDEX idx_blog_posts_like_count ON blog_posts(like_count DESC);
CREATE INDEX idx_blog_posts_cmnt_count ON blog_posts(comment_count DESC);

-- Full text search
ALTER TABLE blog_posts ADD FULLTEXT(title, excerpt);


-- ═══════════════════════════════════════════════════════
-- TABLE 2: blog_comments
-- ═══════════════════════════════════════════════════════

CREATE TABLE `blog_comments` (
  `id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `commenter_name` varchar(100) NOT NULL DEFAULT 'Anonymous',
  `commenter_initials` varchar(4) NOT NULL,
  `commenter_avatar_color` varchar(20) NOT NULL,
  `text` text NOT NULL,
  `like_count` int NOT NULL DEFAULT '0',
  `pinned` tinyint NOT NULL DEFAULT '0',
  `hidden` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_4e0b8959256b08ceb3d001f616b` (`post_id`),
  KEY `FK_e681eead24fde355111a223fc6d` (`parent_id`),
  CONSTRAINT `FK_4e0b8959256b08ceb3d001f616b` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_e681eead24fde355111a223fc6d` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments` (`id`) ON DELETE CASCADE
);
/*
CREATE INDEX idx_blog_comments_post_id
ON blog_comments(post_id, parent_id, created_at DESC);

CREATE INDEX idx_blog_comments_parent_id
ON blog_comments(parent_id);
*/

-- ═══════════════════════════════════════════════════════
-- TABLE 3: blog_likes
-- ═══════════════════════════════════════════════════════

CREATE TABLE `blog_likes` (
  `id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `session_key` varchar(200) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_3478ccbee6353508559f43a9aff` (`post_id`),
  CONSTRAINT `FK_3478ccbee6353508559f43a9aff` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE
) ;
/*
CREATE INDEX idx_blog_likes_post_id
ON blog_likes(post_id);
*/

-- ═══════════════════════════════════════════════════════
-- TABLE 4: blog_qa
-- ═══════════════════════════════════════════════════════

CREATE TABLE `blog_qa` (
  `id` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `category_label` varchar(80) NOT NULL,
  `helpful_count` int NOT NULL DEFAULT '0',
  `published` tinyint NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ;

CREATE INDEX idx_blog_qa_category
ON blog_qa(category);

CREATE INDEX idx_blog_qa_helpful_count
ON blog_qa(helpful_count DESC);

CREATE INDEX idx_blog_qa_published
ON blog_qa(published, sort_order);


-- ═══════════════════════════════════════════════════════
-- TABLE 5: user_questions
-- ═══════════════════════════════════════════════════════

CREATE TABLE `user_questions` (
  `id` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `asker_name` varchar(100) NOT NULL DEFAULT 'Anonymous',
  `asker_email` varchar(255) DEFAULT NULL,
  `answered` tinyint NOT NULL DEFAULT '0',
  `answer` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `answered_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `answered_by` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ;

CREATE INDEX idx_user_questions_answered
ON user_questions(answered, created_at DESC);

CREATE INDEX idx_user_questions_created
ON user_questions(created_at DESC);


-- ═══════════════════════════════════════════════════════
-- TABLE 6: newsletter_subscribers
-- ═══════════════════════════════════════════════════════

CREATE TABLE newsletter_subscribers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),

    email VARCHAR(255) NOT NULL UNIQUE,
    active TINYINT(1) DEFAULT 1,

    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL
);

CREATE INDEX idx_newsletter_email
ON newsletter_subscribers(email);

CREATE INDEX idx_newsletter_active
ON newsletter_subscribers(active);


-- ═══════════════════════════════════════════════════════
-- TABLE 7: blog_views
-- ═══════════════════════════════════════════════════════

CREATE TABLE blog_views (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),

    post_id CHAR(36) NOT NULL,
    session_key VARCHAR(200),
    referrer VARCHAR(500),

    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_blog_views_post
        FOREIGN KEY (post_id) REFERENCES blog_posts(id)
        ON DELETE CASCADE
);
/*
CREATE INDEX idx_blog_views_post_id
ON blog_views(post_id, viewed_at DESC);

CREATE INDEX idx_blog_views_date
ON blog_views(viewed_at DESC);
*/


/*
INSERT INTO country (id,name,iso_code) VALUES
(UUID(),'India','IN'),
(UUID(),'United States','US'),
(UUID(),'United Kingdom','UK'),
(UUID(),'Germany','DE'),
(UUID(),'France','FR'),
(UUID(),'Italy','IT'),
(UUID(),'Spain','ES'),
(UUID(),'Canada','CA'),
(UUID(),'Australia','AU'),
(UUID(),'Brazil','BR'),
(UUID(),'Japan','JP'),
(UUID(),'South Korea','KR'),
(UUID(),'Pakistan','PK'),
(UUID(),'Bangladesh','BD'),
(UUID(),'Sri Lanka','LK'),
(UUID(),'Nepal','NP'),
(UUID(),'Mexico','MX'),
(UUID(),'Argentina','AR'),
(UUID(),'South Africa','ZA'),
(UUID(),'Nigeria','NG');

*/

/*

-- india

INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Bharatiya Janata Party','#FF9933','Narendra Modi','TBD','https://images.seeklogo.com/logo-png/44/1/bjp-logo-png_seeklogo-440196.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Indian National Congress','#19AAED','Mallikarjun Kharge','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Indian_National_Congress_Flag.svg/640px-Indian_National_Congress_Flag.svg.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Aam Aadmi Party','#00AEEF','Arvind Kejriwal','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Aam-aadmi-party-logo.jpg/640px-Aam-aadmi-party-logo.jpg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Bahujan Samaj Party','#0033A0','Mayawati','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Bahujan_Samaj_Party_Flag.svg/640px-Bahujan_Samaj_Party_Flag.svg.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Samajwadi Party','#D60000','Akhilesh Yadav','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Samajwadi_Party_Flag.svg/640px-Samajwadi_Party_Flag.svg.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Dravida Munnetra Kazhagam (DMK)','#E31E24','M K Stalin','TBD','https://images.seeklogo.com/logo-png/41/1/dmk-logo-png_seeklogo-411320.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'AIADMK','#008000','Edappadi K Palaniswami','TBD','https://images.seeklogo.com/logo-png/41/1/aiadmk-logo-png_seeklogo-411321.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Trinamool Congress','#009933','Mamata Banerjee','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/All_India_Trinamool_Congress_flag_%283%29.svg/640px-All_India_Trinamool_Congress_flag_%283%29.svg.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Telugu Desam Party','#FFFF00','N Chandrababu Naidu','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Telugu_Desam_Party_Flag.png/640px-Telugu_Desam_Party_Flag.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'YSR Congress Party','#1E90FF','Y S Jagan Mohan Reddy','TBD','https://4.bp.blogspot.com/-ELaPNYlWzDQ/TXvaYIjau0I/AAAAAAAAKhE/E3OhtfWqpNM/s1600/ysr_flag.jpg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'Shiv Sena','#FF7F00','Uddhav Thackeray','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Shiv_Sena_flag.jpg/640px-Shiv_Sena_flag.jpg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Nationalist Congress Party','#008000','Sharad Pawar','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/NCP-flag.svg/640px-NCP-flag.svg.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Biju Janata Dal','#0066CC','Naveen Patnaik','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Biju_Janata_Dal_Flag.jpg/640px-Biju_Janata_Dal_Flag.jpg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Rashtriya Janata Dal','#008000','Lalu Prasad Yadav','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/RJD_Flag.svg/640px-RJD_Flag.svg.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Janata Dal United','#006400','Nitish Kumar','TBD','https://upload.wikimedia.org/wikipedia/en/8/8f/Janata_Dal_United_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Lok Janshakti Party','#FFCC00','Chirag Paswan','TBD','https://upload.wikimedia.org/wikipedia/en/4/4d/Lok_Janshakti_Party_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Communist Party of India','#FF0000','D Raja','TBD','https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_the_Communist_Party_of_India.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Communist Party of India Marxist','#CC0000','Sitaram Yechury','TBD','https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_the_Communist_Party_of_India_%28Marxist%29.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'Jharkhand Mukti Morcha','#228B22','Hemant Soren','TBD','https://upload.wikimedia.org/wikipedia/en/3/3e/Jharkhand_Mukti_Morcha_Flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Maharashtra Navnirman Sena','#FF9900','Raj Thackeray','TBD','https://upload.wikimedia.org/wikipedia/en/5/5a/MNS_Flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Apna Dal','#009999','Anupriya Patel','TBD','https://upload.wikimedia.org/wikipedia/en/a/a6/Apna_Dal_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Rashtriya Lok Dal','#006600','Jayant Chaudhary','TBD','https://upload.wikimedia.org/wikipedia/en/6/60/RLD_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Assam Gana Parishad','#009933','Atul Bora','TBD','https://upload.wikimedia.org/wikipedia/en/7/7c/AGP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'People Democratic Party','#008080','Mehbooba Mufti','TBD','https://upload.wikimedia.org/wikipedia/en/7/75/Jammu_and_Kashmir_PDP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Jammu and Kashmir National Conference','#CC0000','Farooq Abdullah','TBD','https://upload.wikimedia.org/wikipedia/en/7/74/Jammu_and_Kashmir_National_Conference_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Indian Union Muslim League','#228B22','K M Kader Mohideen','TBD','https://upload.wikimedia.org/wikipedia/en/6/6b/IUML_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Kerala Congress','#33AA33','Jose K Mani','TBD','https://upload.wikimedia.org/wikipedia/en/2/22/Kerala_Congress_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'Pattali Makkal Katchi','#FF0000','Anbumani Ramadoss','TBD','https://upload.wikimedia.org/wikipedia/en/4/4f/PMK_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Desiya Murpokku Dravida Kazhagam','#000000','Vijayakanth','TBD','https://upload.wikimedia.org/wikipedia/en/7/70/DMDK_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Naam Tamilar Katchi','#CC0000','Seeman','TBD','https://imagesvs.oneindia.com/politician-profiles/image/parties/party-flags/naam-tamilar-katchi-flag-912.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Viduthalai Chiruthaigal Katchi','#0000FF','Thol Thirumavalavan','TBD','https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/VCK.svg/640px-VCK.svg.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'All India Forward Bloc','#FF0000','G Devarajan','TBD','https://upload.wikimedia.org/wikipedia/en/f/f0/AIFB_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'Revolutionary Socialist Party','#FF0000','Manoj Bhattacharya','TBD','https://upload.wikimedia.org/wikipedia/en/3/3d/RSP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'All India Majlis-e-Ittehadul Muslimeen','#008000','Asaduddin Owaisi','TBD','https://upload.wikimedia.org/wikipedia/en/0/0f/AIMIM_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Goa Forward Party','#FF6600','Vijai Sardesai','TBD','https://upload.wikimedia.org/wikipedia/en/5/5a/Goa_Forward_Party_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Mizo National Front','#3366CC','Zoramthanga','TBD','https://upload.wikimedia.org/wikipedia/en/2/2a/MNF_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'National People Party','#FFAA00','Conrad Sangma','TBD','https://upload.wikimedia.org/wikipedia/en/2/27/NPP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'United Democratic Party','#336699','Metbah Lyngdoh','TBD','https://upload.wikimedia.org/wikipedia/en/7/70/UDP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Hill State People Democratic Party','#228B22','KP Pangniang','TBD','https://upload.wikimedia.org/wikipedia/en/2/2f/HSPDP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Sikkim Democratic Front','#00AEEF','Pawan Kumar Chamling','TBD','https://upload.wikimedia.org/wikipedia/en/3/3b/SDF_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Sikkim Krantikari Morcha','#FF0000','Prem Singh Tamang','TBD','https://upload.wikimedia.org/wikipedia/en/6/60/SKM_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'Tipra Motha Party','#800080','Pradyot Bikram Manikya','TBD','https://upload.wikimedia.org/wikipedia/en/6/63/TMP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Tripura Indigenous Progressive Regional Alliance','#FFCC00','Motha Leader','TBD','https://upload.wikimedia.org/wikipedia/en/1/14/TIPRA_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Bodoland Peoples Front','#FF0000','Hagrama Mohilary','TBD','https://upload.wikimedia.org/wikipedia/en/3/3c/BPF_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'United Peoples Party Liberal','#0099CC','Pramod Boro','TBD','https://upload.wikimedia.org/wikipedia/en/2/23/UPPL_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Haryana Jannayak Janta Party','#FFFF00','Dushyant Chautala','TBD','https://upload.wikimedia.org/wikipedia/en/2/27/JJP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'Indian National Lok Dal','#009933','Om Prakash Chautala','TBD','https://upload.wikimedia.org/wikipedia/en/7/7d/INLD_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Shiromani Akali Dal','#000080','Sukhbir Singh Badal','TBD','https://upload.wikimedia.org/wikipedia/en/3/34/SAD_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Telangana Rashtra Samithi','#FF69B4','K Chandrashekar Rao','TBD','https://upload.wikimedia.org/wikipedia/en/5/5c/TRS_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Bharat Rashtra Samithi','#FF69B4','K Chandrashekar Rao','TBD','https://upload.wikimedia.org/wikipedia/en/5/5c/TRS_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Janasena Party','#FF0000','Pawan Kalyan','TBD','https://upload.wikimedia.org/wikipedia/en/4/4e/Janasena_Party_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),

(UUID(),'Kerala Congress Mani','#33AA33','Jose K Mani','TBD','https://upload.wikimedia.org/wikipedia/en/2/22/Kerala_Congress_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Kerala Congress Joseph','#33AA33','P J Joseph','TBD','https://upload.wikimedia.org/wikipedia/en/2/22/Kerala_Congress_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Revolutionary Marxist Party','#CC0000','TK Ramakrishnan','TBD','https://upload.wikimedia.org/wikipedia/en/3/3d/RMP_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'All India N R Congress','#3366CC','N Rangasamy','TBD','https://upload.wikimedia.org/wikipedia/en/8/8f/NR_Congress_flag.svg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'All India Anna Dravida Munnetra Kazhagam','#008000','Edappadi K Palaniswami','TBD','https://images.seeklogo.com/logo-png/41/1/aiadmk-logo-png_seeklogo-411321.png',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW()),
(UUID(),'Tamilaga Vettri Kazhagam','#c00500','Vijay','TBD','https://storage.googleapis.com/inv-images/party-logos/tvk.jpg',(SELECT id FROM country WHERE iso_code='IN'),'system',NOW());

-- UK
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Conservative Party','#0087DC','Rishi Sunak','TBD','https://upload.wikimedia.org/wikipedia/en/9/9c/Conservative_Party_logo.svg',(SELECT id FROM country WHERE iso_code='UK'),'system',NOW()),
(UUID(),'Labour Party','#E4003B','Keir Starmer','TBD','https://upload.wikimedia.org/wikipedia/en/b/bf/Labour_Party_logo.svg',(SELECT id FROM country WHERE iso_code='UK'),'system',NOW()),
(UUID(),'Liberal Democrats','#FAA61A','Ed Davey','TBD','https://upload.wikimedia.org/wikipedia/en/5/59/Liberal_Democrats_logo.svg',(SELECT id FROM country WHERE iso_code='UK'),'system',NOW()),
(UUID(),'Scottish National Party','#FFF95D','Humza Yousaf','TBD','https://upload.wikimedia.org/wikipedia/en/0/06/Scottish_National_Party_logo.svg',(SELECT id FROM country WHERE iso_code='UK'),'system',NOW()),

(UUID(),'Social Democratic Party of Germany','#E3000F','Olaf Scholz','TBD','https://upload.wikimedia.org/wikipedia/commons/5/5f/Logo_SPD.svg',(SELECT id FROM country WHERE iso_code='DE'),'system',NOW()),
(UUID(),'Christian Democratic Union','#000000','Friedrich Merz','TBD','https://upload.wikimedia.org/wikipedia/commons/3/37/CDU_Logo.svg',(SELECT id FROM country WHERE iso_code='DE'),'system',NOW()),
(UUID(),'Alliance 90 The Greens','#1AA037','Ricarda Lang','TBD','https://upload.wikimedia.org/wikipedia/commons/6/6c/Die_Gruenen_Logo.svg',(SELECT id FROM country WHERE iso_code='DE'),'system',NOW()),
(UUID(),'Free Democratic Party','#FFED00','Christian Lindner','TBD','https://upload.wikimedia.org/wikipedia/commons/0/0f/FDP_Logo.svg',(SELECT id FROM country WHERE iso_code='DE'),'system',NOW()),

(UUID(),'Renaissance','#FFD700','Emmanuel Macron','TBD','https://upload.wikimedia.org/wikipedia/commons/3/3c/Renaissance_party_logo.svg',(SELECT id FROM country WHERE iso_code='FR'),'system',NOW()),
(UUID(),'National Rally','#002395','Jordan Bardella','TBD','https://upload.wikimedia.org/wikipedia/commons/8/8b/Rassemblement_national_logo.svg',(SELECT id FROM country WHERE iso_code='FR'),'system',NOW()),
(UUID(),'Socialist Party','#E30613','Olivier Faure','TBD','https://upload.wikimedia.org/wikipedia/commons/7/75/Parti_socialiste_logo.svg',(SELECT id FROM country WHERE iso_code='FR'),'system',NOW()),

(UUID(),'Brothers of Italy','#003399','Giorgia Meloni','TBD','https://upload.wikimedia.org/wikipedia/commons/8/84/Fratelli_d%27Italia_logo.svg',(SELECT id FROM country WHERE iso_code='IT'),'system',NOW()),
(UUID(),'Democratic Party','#009933','Elly Schlein','TBD','https://upload.wikimedia.org/wikipedia/commons/4/4d/Partito_Democratico_logo.svg',(SELECT id FROM country WHERE iso_code='IT'),'system',NOW()),

(UUID(),'Spanish Socialist Workers Party','#E3001B','Pedro Sanchez','TBD','https://upload.wikimedia.org/wikipedia/commons/2/2f/PSOE_logo.svg',(SELECT id FROM country WHERE iso_code='ES'),'system',NOW()),
(UUID(),'People Party','#0056A3','Alberto Nunez Feijoo','TBD','https://upload.wikimedia.org/wikipedia/commons/5/5c/Partido_Popular_logo.svg',(SELECT id FROM country WHERE iso_code='ES'),'system',NOW());

-- USA
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Democratic Party','#0015BC','Joe Biden','TBD','https://upload.wikimedia.org/wikipedia/commons/0/02/Democratic_Party_%28United_States%29_logo.svg',(SELECT id FROM country WHERE iso_code='US'),'system',NOW()),
(UUID(),'Republican Party','#E9141D','Donald Trump','TBD','https://upload.wikimedia.org/wikipedia/commons/9/9b/Republicanlogo.svg',(SELECT id FROM country WHERE iso_code='US'),'system',NOW()),
(UUID(),'Libertarian Party','#FDBB30','Angela McArdle','TBD','https://upload.wikimedia.org/wikipedia/commons/9/9e/Libertarian_Party_logo.svg',(SELECT id FROM country WHERE iso_code='US'),'system',NOW()),
(UUID(),'Green Party','#00A95C','Jill Stein','TBD','https://upload.wikimedia.org/wikipedia/commons/6/6c/Green_Party_US_logo.svg',(SELECT id FROM country WHERE iso_code='US'),'system',NOW()),

(UUID(),'Liberal Party of Canada','#D71920','Justin Trudeau','TBD','https://upload.wikimedia.org/wikipedia/en/6/6e/Liberal_Party_of_Canada_logo.svg',(SELECT id FROM country WHERE iso_code='CA'),'system',NOW()),
(UUID(),'Conservative Party of Canada','#002395','Pierre Poilievre','TBD','https://upload.wikimedia.org/wikipedia/en/b/b0/Conservative_Party_of_Canada_logo.svg',(SELECT id FROM country WHERE iso_code='CA'),'system',NOW()),

(UUID(),'Workers Party','#CC0000','Luiz Inacio Lula da Silva','TBD','https://upload.wikimedia.org/wikipedia/commons/0/0e/Partido_dos_Trabalhadores_logo.svg',(SELECT id FROM country WHERE iso_code='BR'),'system',NOW()),
(UUID(),'Liberal Party Brazil','#005BBB','Valdemar Costa Neto','TBD','https://upload.wikimedia.org/wikipedia/commons/e/e3/Partido_Liberal_logo.svg',(SELECT id FROM country WHERE iso_code='BR'),'system',NOW()),

(UUID(),'National Regeneration Movement','#8B0000','Andres Manuel Lopez Obrador','TBD','https://upload.wikimedia.org/wikipedia/commons/0/09/Morena_logo.svg',(SELECT id FROM country WHERE iso_code='MX'),'system',NOW());

-- PK
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)

VALUES
(UUID(),'Pakistan Tehreek-e-Insaf','#007A3D','Imran Khan','TBD','https://upload.wikimedia.org/wikipedia/en/1/1c/PTI_flag.svg',(SELECT id FROM country WHERE iso_code='PK'),'system',NOW()),
(UUID(),'Pakistan Muslim League N','#006600','Shehbaz Sharif','TBD','https://upload.wikimedia.org/wikipedia/en/5/5f/PMLN_flag.svg',(SELECT id FROM country WHERE iso_code='PK'),'system',NOW()),
(UUID(),'Pakistan Peoples Party','#000000','Bilawal Bhutto Zardari','TBD','https://upload.wikimedia.org/wikipedia/en/3/33/PPP_flag.svg',(SELECT id FROM country WHERE iso_code='PK'),'system',NOW());

-- BD
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Awami League','#006A4E','Sheikh Hasina','TBD','https://upload.wikimedia.org/wikipedia/en/6/6f/Awami_League_flag.svg',(SELECT id FROM country WHERE iso_code='BD'),'system',NOW()),
(UUID(),'Bangladesh Nationalist Party','#006600','Khaleda Zia','TBD','https://upload.wikimedia.org/wikipedia/en/7/7a/BNP_flag.svg',(SELECT id FROM country WHERE iso_code='BD'),'system',NOW());
-- Nepal
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Nepali Congress','#1E90FF','Sher Bahadur Deuba','TBD','https://upload.wikimedia.org/wikipedia/en/2/2e/Nepali_Congress_flag.svg',(SELECT id FROM country WHERE iso_code='NP'),'system',NOW()),
(UUID(),'Communist Party of Nepal UML','#CC0000','K P Sharma Oli','TBD','https://upload.wikimedia.org/wikipedia/en/0/0c/CPN-UML_flag.svg',(SELECT id FROM country WHERE iso_code='NP'),'system',NOW());
-- SL
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Sri Lanka Podujana Peramuna','#8B0000','Mahinda Rajapaksa','TBD','https://upload.wikimedia.org/wikipedia/en/5/5e/SLPP_flag.svg',(SELECT id FROM country WHERE iso_code='LK'),'system',NOW()),
(UUID(),'United National Party','#00AEEF','Ranil Wickremesinghe','TBD','https://upload.wikimedia.org/wikipedia/en/2/2c/UNP_flag.svg',(SELECT id FROM country WHERE iso_code='LK'),'system',NOW());
-- Japan
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Liberal Democratic Party','#003399','Fumio Kishida','TBD','https://upload.wikimedia.org/wikipedia/commons/9/9f/LDP_Japan_logo.svg',(SELECT id FROM country WHERE iso_code='JP'),'system',NOW()),
(UUID(),'Constitutional Democratic Party','#007FFF','Kenta Izumi','TBD','https://upload.wikimedia.org/wikipedia/commons/7/7e/CDP_logo.svg',(SELECT id FROM country WHERE iso_code='JP'),'system',NOW());

-- South Korea
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Democratic Party of Korea','#005BAC','Lee Jae-myung','TBD','https://upload.wikimedia.org/wikipedia/commons/2/2e/Democratic_Party_of_Korea_logo.svg',(SELECT id FROM country WHERE iso_code='KR'),'system',NOW()),
(UUID(),'People Power Party','#E61E2A','Han Dong-hoon','TBD','https://upload.wikimedia.org/wikipedia/commons/3/35/People_Power_Party_logo.svg',(SELECT id FROM country WHERE iso_code='KR'),'system',NOW());

-- Indonesia
INSERT INTO party_master
(id,name,color,leader_name,contestant_name,logo_url,country_id,created_by,created_at)
VALUES
(UUID(),'Indonesian Democratic Party of Struggle','#E3000F','Megawati Sukarnoputri','TBD','https://upload.wikimedia.org/wikipedia/commons/3/3e/PDI-P_logo.svg',(SELECT id FROM country WHERE iso_code='ID'),'system',NOW()),
(UUID(),'Golkar','#FFD700','Airlangga Hartarto','TBD','https://upload.wikimedia.org/wikipedia/commons/e/e2/Golkar_logo.svg',(SELECT id FROM country WHERE iso_code='ID'),'system',NOW()),
(UUID(),'Gerindra','#B22222','Prabowo Subianto','TBD','https://upload.wikimedia.org/wikipedia/commons/3/3e/Gerindra_logo.svg',(SELECT id FROM country WHERE iso_code='ID'),'system',NOW());

*/
