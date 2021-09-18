-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 172.22.0.1:3306
-- Generation Time: Sep 18, 2021 at 08:40 AM
-- Server version: 8.0.26-0ubuntu0.20.04.2
-- PHP Version: 7.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `expense`
--
CREATE DATABASE IF NOT EXISTS `expense` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `expense`;

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `account_type_id` bigint NOT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `is_frequent` tinyint(1) DEFAULT NULL,
  `is_snapshot_disable` tinyint(1) DEFAULT NULL,
  `is_closed` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account_types`
--

CREATE TABLE `account_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` bigint NOT NULL,
  `from_account_id` bigint DEFAULT NULL,
  `to_account_id` bigint DEFAULT NULL,
  `tag_id` bigint NOT NULL,
  `sub_tag_id` bigint DEFAULT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `remarks` text,
  `transaction_type_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Triggers `activities`
--
DELIMITER $$
CREATE TRIGGER `after_activity_trigger` AFTER INSERT ON `activities` FOR EACH ROW BEGIN
DECLARE old_balance decimal(20,2);
DECLARE transaction_type varchar(20);

IF NEW.from_account_id IS NULL THEN
  set old_balance = ( select amount from accounts where id = NEW.to_account_id );
  set transaction_type = ( select id from transaction_types where slug = 'credit' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.to_account_id, NEW.id, old_balance, transaction_type, old_balance + NEW.amount, now(), now());
  update accounts set amount = old_balance + NEW.amount, updated_at = now() where id = NEW.to_account_id;
ELSEIF NEW.to_account_id IS NULL THEN
  set old_balance = ( select amount from accounts where id = NEW.from_account_id );
  set transaction_type = ( select id from transaction_types where slug = 'debit' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.from_account_id, NEW.id, old_balance, transaction_type, old_balance - NEW.amount, now(), now());
  update accounts set amount = old_balance - NEW.amount, updated_at = now() where id = NEW.from_account_id;
ELSE
  set old_balance = ( select amount from accounts where id = NEW.from_account_id );
  set transaction_type = ( select id from transaction_types where slug = 'debit' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.from_account_id, NEW.id, old_balance, transaction_type, old_balance - NEW.amount, now(), now());
  update accounts set amount = old_balance - NEW.amount, updated_at = now() where id = NEW.from_account_id;

  set old_balance = ( select amount from accounts where id = NEW.to_account_id );
  set transaction_type = ( select id from transaction_types where slug = 'credit' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.to_account_id, NEW.id, old_balance, transaction_type, old_balance + NEW.amount, now(), now());
  update accounts set amount = old_balance + NEW.amount, updated_at = now() where id = NEW.to_account_id;
END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `passbooks`
--

CREATE TABLE `passbooks` (
  `id` bigint NOT NULL,
  `account_id` bigint NOT NULL,
  `activity_id` bigint DEFAULT NULL,
  `previous_balance` decimal(20,2) DEFAULT NULL,
  `transaction_type_id` bigint NOT NULL,
  `balance` decimal(20,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `version` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `snapshots`
--

CREATE TABLE `snapshots` (
  `id` bigint NOT NULL,
  `saving` decimal(20,2) DEFAULT NULL,
  `credit` decimal(20,2) DEFAULT NULL,
  `loan` decimal(20,2) DEFAULT NULL,
  `invest` decimal(20,2) DEFAULT NULL,
  `deposit` decimal(20,2) DEFAULT NULL,
  `donate` decimal(20,2) DEFAULT NULL,
  `wallet` decimal(20,2) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `transaction_type_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `tag_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_types`
--

CREATE TABLE `transaction_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_accounts_on_name` (`name`),
  ADD UNIQUE KEY `index_accounts_on_slug` (`slug`),
  ADD KEY `index_accounts_on_account_type_id` (`account_type_id`);

--
-- Indexes for table `account_types`
--
ALTER TABLE `account_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_account_types_on_name` (`name`),
  ADD UNIQUE KEY `index_account_types_on_slug` (`slug`);

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `index_activities_on_from_account_id` (`from_account_id`),
  ADD KEY `index_activities_on_to_account_id` (`to_account_id`),
  ADD KEY `index_activities_on_tag_id` (`tag_id`),
  ADD KEY `index_activities_on_transaction_type_id` (`transaction_type_id`),
  ADD KEY `FK_ACTIVITIES_TABLE_CHILD_TAG_ID` (`sub_tag_id`);

--
-- Indexes for table `passbooks`
--
ALTER TABLE `passbooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `index_passbooks_on_account_id` (`account_id`),
  ADD KEY `index_passbooks_on_activity_id` (`activity_id`),
  ADD KEY `index_passbooks_on_transaction_type_id` (`transaction_type_id`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`version`);

--
-- Indexes for table `snapshots`
--
ALTER TABLE `snapshots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_tags_on_name` (`name`),
  ADD UNIQUE KEY `index_tags_on_slug` (`slug`),
  ADD KEY `index_tags_on_transaction_type_id` (`transaction_type_id`),
  ADD KEY `index_tags_on_tag_id` (`tag_id`);

--
-- Indexes for table `transaction_types`
--
ALTER TABLE `transaction_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_transaction_types_on_name` (`name`),
  ADD UNIQUE KEY `index_transaction_types_on_slug` (`slug`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_types`
--
ALTER TABLE `account_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `passbooks`
--
ALTER TABLE `passbooks`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `snapshots`
--
ALTER TABLE `snapshots`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_types`
--
ALTER TABLE `transaction_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `fk_rails_61f9ab2964` FOREIGN KEY (`account_type_id`) REFERENCES `account_types` (`id`);

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `FK_ACTIVITIES_TABLE_CHILD_TAG_ID` FOREIGN KEY (`sub_tag_id`) REFERENCES `tags` (`id`),
  ADD CONSTRAINT `fk_rails_536f0e5d8e` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`),
  ADD CONSTRAINT `fk_rails_6975058647` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_types` (`id`),
  ADD CONSTRAINT `fk_rails_ae18706e5b` FOREIGN KEY (`to_account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `fk_rails_e6d7d17428` FOREIGN KEY (`from_account_id`) REFERENCES `accounts` (`id`);

--
-- Constraints for table `passbooks`
--
ALTER TABLE `passbooks`
  ADD CONSTRAINT `fk_rails_7058f1c5fb` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `fk_rails_7dde36353c` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_types` (`id`);

--
-- Constraints for table `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `fk_rails_ab705d38e0` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_types` (`id`),
  ADD CONSTRAINT `fk_rails_dcd2e47036` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
