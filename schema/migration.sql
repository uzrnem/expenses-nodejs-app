ALTER TABLE `accounts` DROP `slug`;
ALTER TABLE `account_types` DROP `slug`;
ALTER TABLE `tags` DROP `slug`;
ALTER TABLE `transaction_types` DROP `slug`;
DROP TABLE `schema_migrations`
DROP TABLE `snapshots`