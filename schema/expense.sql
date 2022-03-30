SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `accounts` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `account_type_id` bigint NOT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `is_frequent` tinyint(1) DEFAULT NULL,
  `is_snapshot_disable` tinyint(1) DEFAULT NULL,
  `is_closed` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `account_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `account_types` (`id`, `name`) VALUES
(2, 'Credit'),
(5, 'Deposit'),
(6, 'Donate'),
(4, 'Invest'),
(3, 'Loan'),
(9, 'Mutual Funds'),
(1, 'Saving'),
(8, 'Stocks Equity'),
(7, 'Wallet');

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
DELIMITER $$
CREATE TRIGGER `after_activity_trigger` AFTER INSERT ON `activities` FOR EACH ROW BEGIN
DECLARE old_balance decimal(20,2);
DECLARE transaction_type varchar(20);

IF NEW.from_account_id IS NULL THEN
  set old_balance = ( select amount from accounts where id = NEW.to_account_id );
  set transaction_type = ( select id from transaction_types where name = 'Income' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.to_account_id, NEW.id, old_balance, transaction_type, old_balance + NEW.amount, now(), now());
  update accounts set amount = old_balance + NEW.amount, updated_at = now() where id = NEW.to_account_id;
ELSEIF NEW.to_account_id IS NULL THEN
  set old_balance = ( select amount from accounts where id = NEW.from_account_id );
  set transaction_type = ( select id from transaction_types where name = 'Expense' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.from_account_id, NEW.id, old_balance, transaction_type, old_balance - NEW.amount, now(), now());
  update accounts set amount = old_balance - NEW.amount, updated_at = now() where id = NEW.from_account_id;
ELSE
  set old_balance = ( select amount from accounts where id = NEW.from_account_id );
  set transaction_type = ( select id from transaction_types where name = 'Expense' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.from_account_id, NEW.id, old_balance, transaction_type, old_balance - NEW.amount, now(), now());
  update accounts set amount = old_balance - NEW.amount, updated_at = now() where id = NEW.from_account_id;

  set old_balance = ( select amount from accounts where id = NEW.to_account_id );
  set transaction_type = ( select id from transaction_types where name = 'Income' );
  INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
  VALUES(NEW.to_account_id, NEW.id, old_balance, transaction_type, old_balance + NEW.amount, now(), now());
  update accounts set amount = old_balance + NEW.amount, updated_at = now() where id = NEW.to_account_id;
END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_delete_activity_trigger` BEFORE DELETE ON `activities` FOR EACH ROW BEGIN
  DELETE FROM passbooks where activity_id = OLD.id;
  IF OLD.from_account_id IS NULL THEN
    
    update accounts a set amount = amount - OLD.amount, updated_at = now() where id = OLD.to_account_id;
  ELSEIF OLD.to_account_id IS NULL THEN
    
    update accounts set amount = amount + OLD.amount, updated_at = now() where id = OLD.from_account_id;
  ELSE
    
    update accounts set amount = amount - OLD.amount, updated_at = now() where id = OLD.to_account_id;
    update accounts set amount = amount + OLD.amount, updated_at = now() where id = OLD.from_account_id;
  END IF;
END
$$
DELIMITER ;

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

CREATE TABLE `statements` (
  `id` bigint NOT NULL,
  `account_id` bigint DEFAULT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `remarks` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tags` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `transaction_type_id` bigint NOT NULL,
  `tag_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `tags` (`id`, `name`, `transaction_type_id`, `tag_id`) VALUES
(1, 'Rent', 2, 29),
(2, 'Fuel', 2, 10),
(3, 'Salary', 3, 61),
(4, 'Credit Card Bill', 1, 24),
(6, 'Monthly Expense', 1, NULL),
(7, 'Added to Wallet', 1, NULL),
(8, 'House Hold', 2, NULL),
(9, 'Food', 2, NULL),
(10, 'Purchase', 2, NULL),
(11, 'Loan', 1, 24),
(12, 'Barrow', 1, 24),
(13, 'Collect', 3, NULL),
(14, 'Returned', 2, NULL),
(15, 'Service', 2, 29),
(16, 'Subscription', 2, 29),
(17, 'Cashback', 3, 62),
(18, 'To Parent', 2, NULL),
(19, 'Fix By Credit', 3, NULL),
(20, 'Fix By Debit', 2, NULL),
(21, 'Refund', 3, 61),
(22, 'Bank Interest', 3, 61),
(24, 'Transfer', 1, NULL),
(25, 'From Parent', 3, NULL),
(26, 'Parent', 1, NULL),
(27, 'Reward', 3, 62),
(28, 'Electricity', 2, 29),
(29, 'Bill', 2, NULL),
(30, 'Restaurant', 2, 9),
(31, 'Purchase: Equity', 1, 24),
(32, 'Sold', 3, NULL),
(33, 'Sold: Equity', 1, 24),
(34, 'Earn Profit', 3, 61),
(35, 'Purchase: Mutual Fund', 1, 24),
(36, 'Sold: Mutual Fund', 1, 24),
(38, 'Voucher', 3, 61),
(39, 'Create FD', 1, 24),
(40, 'Break FD', 1, 24),
(42, 'Booked Loss', 2, NULL),
(43, 'Dividend', 3, 62),
(44, 'Cloths', 2, 10),
(45, 'Milk', 2, 8),
(46, 'Travelling', 2, 29),
(47, 'Fees', 2, 29),
(48, 'Big Basket', 2, 8),
(49, 'Recharge', 2, 29),
(50, 'Investment Charges', 2, 29),
(51, 'Swiggy', 2, 9),
(52, 'Shop', 2, 8),
(55, 'LIC', 2, 29),
(57, 'Jwellery', 2, 10),
(58, 'EMI', 2, NULL),
(60, 'EMI Charges', 2, 58),
(61, 'Earning', 3, NULL),
(62, 'Benefits', 3, NULL),
(63, 'FD Interest', 3, 61),
(64, 'Charges', 2, 29),
(65, 'Gas Cylinder', 2, 8),
(66, 'Medician', 2, 10),
(67, 'Entertainment', 2, 29),
(68, 'Electronic', 2, 10),
(69, 'Cosmetic', 2, 10),
(70, 'Offline', 2, 10),
(71, 'Online', 2, 10),
(72, 'Drink', 2, 9),
(73, 'Desert', 2, 9),
(74, 'Groccery', 2, 8),
(75, 'Hospital', 2, 29),
(76, 'Fruits', 2, 9);

CREATE TABLE `transaction_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `transaction_types` (`id`, `name`) VALUES
(2, 'Expense'),
(3, 'Income'),
(1, 'Transfer');


ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_accounts_on_name` (`name`),
  ADD KEY `index_accounts_on_account_type_id` (`account_type_id`);

ALTER TABLE `account_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_account_types_on_name` (`name`);

ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `index_activities_on_from_account_id` (`from_account_id`),
  ADD KEY `index_activities_on_to_account_id` (`to_account_id`),
  ADD KEY `index_activities_on_tag_id` (`tag_id`),
  ADD KEY `index_activities_on_transaction_type_id` (`transaction_type_id`),
  ADD KEY `FK_ACTIVITIES_TABLE_CHILD_TAG_ID` (`sub_tag_id`);

ALTER TABLE `passbooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `index_passbooks_on_account_id` (`account_id`),
  ADD KEY `index_passbooks_on_activity_id` (`activity_id`),
  ADD KEY `index_passbooks_on_transaction_type_id` (`transaction_type_id`);

ALTER TABLE `statements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_id` (`account_id`,`event_date`),
  ADD KEY `index_activities_on_from_account_id` (`account_id`);

ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_tags_on_name` (`name`),
  ADD KEY `index_tags_on_transaction_type_id` (`transaction_type_id`),
  ADD KEY `index_tags_on_tag_id` (`tag_id`);

ALTER TABLE `transaction_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `index_transaction_types_on_name` (`name`);


ALTER TABLE `accounts`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `account_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `activities`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `passbooks`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `statements`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `tags`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

ALTER TABLE `transaction_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `accounts`
  ADD CONSTRAINT `fk_rails_61f9ab2964` FOREIGN KEY (`account_type_id`) REFERENCES `account_types` (`id`);

ALTER TABLE `activities`
  ADD CONSTRAINT `FK_ACTIVITIES_TABLE_CHILD_TAG_ID` FOREIGN KEY (`sub_tag_id`) REFERENCES `tags` (`id`),
  ADD CONSTRAINT `fk_rails_536f0e5d8e` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`),
  ADD CONSTRAINT `fk_rails_6975058647` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_types` (`id`),
  ADD CONSTRAINT `fk_rails_ae18706e5b` FOREIGN KEY (`to_account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `fk_rails_e6d7d17428` FOREIGN KEY (`from_account_id`) REFERENCES `accounts` (`id`);

ALTER TABLE `passbooks`
  ADD CONSTRAINT `fk_rails_7058f1c5fb` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`),
  ADD CONSTRAINT `fk_rails_7dde36353c` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_types` (`id`);

ALTER TABLE `tags`
  ADD CONSTRAINT `fk_rails_ab705d38e0` FOREIGN KEY (`transaction_type_id`) REFERENCES `transaction_types` (`id`),
  ADD CONSTRAINT `fk_rails_dcd2e47036` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;