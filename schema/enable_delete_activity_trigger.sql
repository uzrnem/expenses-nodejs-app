-- mysql -u root -p expense_test < enable_delete_activity_trigger.sql
DELIMITER $$
CREATE TRIGGER `before_delete_activity_trigger`
BEFORE DELETE
ON `activities` FOR EACH ROW
BEGIN
  DELETE FROM passbooks where activity_id = OLD.id;
  IF OLD.from_account_id IS NULL THEN
    update accounts a set amount = amount - OLD.amount, updated_at = now() where id = OLD.to_account_id;
  ELSEIF OLD.to_account_id IS NULL THEN
    update accounts set amount = amount + OLD.amount, updated_at = now() where id = OLD.from_account_id;
  ELSE
    update accounts set amount = amount - OLD.amount, updated_at = now() where id = OLD.to_account_id;
    update accounts set amount = amount + OLD.amount, updated_at = now() where id = OLD.from_account_id;
  END IF;
END$$

DELIMITER ;