-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Sep 19, 2021 at 03:13 AM
-- Server version: 8.0.26
-- PHP Version: 7.4.20

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

--
-- Dumping data for table `account_types`
--

INSERT INTO `account_types` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Saving', 'saving', '2020-12-01 06:10:52.201825', '2020-12-01 06:10:52.201825'),
(2, 'Credit', 'credit', '2020-12-01 06:10:52.209946', '2020-12-01 06:10:52.209946'),
(3, 'Loan', 'loan', '2020-12-01 06:10:52.218239', '2020-12-01 06:10:52.218239'),
(4, 'Invest', 'invest', '2020-12-01 06:10:52.226476', '2020-12-01 06:10:52.226476'),
(5, 'Deposit', 'deposit', '2020-12-01 06:10:52.239890', '2020-12-01 06:10:52.239890'),
(6, 'Donate', 'donate', '2020-12-01 06:10:52.249280', '2020-12-01 06:10:52.249280'),
(7, 'Wallet', 'wallet', '2020-12-01 06:10:52.257604', '2020-12-01 06:10:52.257604'),
(8, 'Stocks Equity', 'equity', '2021-09-19 08:42:45.000000', '2021-09-19 08:42:52.000000'),
(9, 'Mutual Funds', 'mutual_funds', '2021-09-19 08:42:57.000000', '2021-09-19 08:43:04.000000');

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

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `slug`, `transaction_type_id`, `created_at`, `updated_at`, `tag_id`) VALUES
(1, 'Rent', 'rent', 2, '2020-12-01 06:10:52.277533', '2020-12-01 06:10:52.277533', 29),
(2, 'Fuel', 'fuel', 2, '2020-12-01 06:10:52.288375', '2020-12-01 06:10:52.288375', 10),
(3, 'Salary', 'salary', 3, '2020-12-01 06:10:52.298147', '2020-12-01 06:10:52.298147', 61),
(4, 'Credit Card Bill', 'credit_bill', 1, '2020-12-01 06:10:52.306490', '2020-12-01 06:10:52.306490', 24),
(5, 'Premium / Fees', 'premium', 2, '2020-12-01 06:10:52.316808', '2020-12-01 06:10:52.316808', 29),
(6, 'Monthly Expense', 'monthly_expense', 1, '2020-12-01 06:10:52.335274', '2020-12-01 06:10:52.335274', NULL),
(7, 'Added to Wallet', 'add_wallet', 1, '2020-12-01 06:10:52.357597', '2020-12-01 06:10:52.357597', NULL),
(8, 'House Hold', 'house_hold', 2, '2020-12-01 06:10:52.379874', '2020-12-01 06:10:52.379874', NULL),
(9, 'Purchase: Food', 'food', 2, '2020-12-01 06:10:52.394968', '2020-12-01 06:10:52.394968', NULL),
(10, 'Purchase', 'purchase', 2, '2020-12-01 06:10:52.404984', '2020-12-01 06:10:52.404984', NULL),
(11, 'Loan', 'loan', 2, '2020-12-01 06:10:52.418701', '2020-12-01 06:10:52.418701', NULL),
(12, 'Barrow', 'barrow', 3, '2020-12-01 06:10:52.427624', '2020-12-01 06:10:52.427624', NULL),
(13, 'Collect', 'collect', 3, '2020-12-01 06:10:52.443507', '2020-12-01 06:10:52.443507', NULL),
(14, 'Returned', 'return', 2, '2020-12-01 06:10:52.466007', '2020-12-01 06:10:52.466007', NULL),
(15, 'Service', 'service', 2, '2020-12-01 06:10:52.488923', '2020-12-01 06:10:52.488923', NULL),
(16, 'Purchase: Entertainment', 'entertainment', 2, '2020-12-01 06:10:52.510010', '2020-12-01 06:10:52.510010', 29),
(17, 'Cashback', 'cashback', 3, '2020-12-01 06:10:52.525671', '2020-12-01 06:10:52.525671', 62),
(18, 'To Parent', 'to_parent', 2, '2020-12-01 06:10:52.536167', '2020-12-01 06:10:52.536167', NULL),
(19, 'Fix By Credit', 'fix_credit', 3, '2020-12-01 07:17:12.793251', '2020-12-01 07:17:12.793251', NULL),
(20, 'Fix By Debit', 'fix_debit', 2, '2020-12-01 07:17:12.810967', '2020-12-01 07:17:12.810967', NULL),
(21, 'Refund', 'refund', 3, '2020-12-02 12:06:44.294463', '2020-12-02 12:06:44.294463', 61),
(22, 'Bank Interest', 'bank_interest', 3, '2020-12-03 07:59:26.139241', '2020-12-03 07:59:26.139241', 61),
(24, 'Transfer', 'transfer', 1, '2020-12-06 04:07:23.911261', '2020-12-06 04:07:23.911261', NULL),
(25, 'From Parent', 'from_parent', 3, '2020-12-10 07:05:10.464610', '2020-12-10 07:05:10.464610', NULL),
(26, 'Parent', 'parent', 1, '2020-12-10 07:05:10.480063', '2020-12-10 07:05:10.480063', NULL),
(27, 'Reward', 'reward', 3, NULL, NULL, 62),
(28, 'Light Bill', 'light_bill', 2, NULL, NULL, 29),
(29, 'Bill', 'bill', 2, NULL, NULL, NULL),
(30, 'Restaurant', 'restaurant', 2, NULL, NULL, 9),
(31, 'Purchase: Equity', 'buy_equity', 1, NULL, NULL, 24),
(32, 'Sold', 'sold', 3, NULL, NULL, NULL),
(33, 'Sold: Equity', 'sell_equity', 1, NULL, NULL, 24),
(34, 'Earn Profit', 'earn_profit', 3, NULL, NULL, 61),
(35, 'Purchase: Mutual Fund', 'purchase_mf', 1, NULL, NULL, 24),
(36, 'Sold: Mutual Fund', 'sold_mf', 1, NULL, NULL, 24),
(37, 'Shopping', 'shopping', 2, NULL, NULL, NULL),
(38, 'Voucher', 'voucher', 3, NULL, NULL, 61),
(39, 'Create FD', 'create_fd', 1, NULL, NULL, 24),
(40, 'Break FD', 'break_fd', 1, NULL, NULL, 24),
(42, 'Booked Loss', 'booked_loss', 2, NULL, NULL, NULL),
(43, 'Dividend', 'dividend', 3, NULL, NULL, 62),
(44, 'Cloths', 'cloths', 2, NULL, NULL, 37),
(45, 'Milk', 'milk', 2, NULL, NULL, 8),
(46, 'Travelling', 'travelling', 2, NULL, NULL, 15),
(47, 'Tuition Fees', 'tuition_fees', 2, NULL, NULL, 5),
(48, 'Big Basket', 'big_basket', 2, NULL, NULL, 8),
(49, 'Recharge', 'recharge', 2, NULL, NULL, 5),
(50, 'Investment Charges', 'investment_charges', 2, NULL, NULL, 15),
(51, 'Swiggy', 'swiggy', 2, NULL, NULL, 9),
(52, 'Shop', 'shop', 2, NULL, NULL, 8),
(55, 'LIC', 'lic', 2, NULL, NULL, 5),
(56, 'Home Shopping', 'home_shopping', 2, NULL, NULL, 37),
(57, 'Jwellery', 'jwellery', 2, NULL, NULL, 37),
(58, 'EMI', 'emi', 2, NULL, NULL, NULL),
(59, 'EMI GST', 'emi_gst', 2, NULL, NULL, 58),
(60, 'EMI Charges', 'emi_charges', 2, NULL, NULL, 58),
(61, 'Earning', 'earning', 3, NULL, NULL, NULL),
(62, 'Benefits', 'benefits', 3, NULL, NULL, NULL),
(63, 'FD Interest', 'fd_interest', 3, NULL, NULL, 61),
(64, 'Charges', 'charges', 2, NULL, NULL, 15),
(65, 'Gas Cylinder', 'gas_cylinder', 2, NULL, NULL, 8),
(66, 'Medician', 'medicine', 2, NULL, NULL, 10),
(67, 'Gas', 'gas', 2, NULL, NULL, 29);

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
-- Dumping data for table `transaction_types`
--

INSERT INTO `transaction_types` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Transfer', 'transfer', '2020-12-01 06:10:52.170524', '2020-12-01 06:10:52.170524'),
(2, 'Expense', 'debit', '2020-12-01 06:10:52.180012', '2020-12-01 06:10:52.180012'),
(3, 'Income', 'credit', '2020-12-01 06:10:52.187059', '2020-12-01 06:10:52.187059');

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
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `transaction_types`
--
ALTER TABLE `transaction_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
