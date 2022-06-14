select NOT (2 <=> 1), NOT (2 <=> 2), NOT (null <=> 1), NOT (2 <=> null), 2 != 1, 2 != null , null != null, 1 !=null;

BEGIN
  DECLARE old_balance decimal(20,2);
  DECLARE transaction_type varchar(20);


  IF NOT (OLD.from_account_id <=> NEW.from_account_id) THEN
    IF OLD.from_account_id IS NOT NULL THEN
      DELETE FROM passbooks where activity_id = OLD.id and account_id = OLD.from_account_id;
      update accounts set amount = amount + OLD.amount, updated_at = now() where id = OLD.from_account_id;
    END IF;
    
    IF NEW.from_account_id IS NOT NULL THEN
      set old_balance = ( select amount from accounts where id = NEW.from_account_id );
      set transaction_type = ( select id from transaction_types where name = 'Expense' );
      INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
      VALUES(NEW.from_account_id, NEW.id, old_balance, transaction_type, old_balance - NEW.amount, now(), now());
      update accounts set amount = old_balance - NEW.amount, updated_at = now() where id = NEW.from_account_id;
    END IF;
  END IF;

  IF NOT (OLD.to_account_id <=> NEW.to_account_id) THEN
    IF OLD.to_account_id IS NOT NULL THEN
      DELETE FROM passbooks where activity_id = OLD.id and account_id = OLD.to_account_id;
      update accounts a set amount = amount - OLD.amount, updated_at = now() where id = OLD.to_account_id;
    END IF;

    IF NEW.to_account_id IS NOT NULL THEN
      set old_balance = ( select amount from accounts where id = NEW.to_account_id );
      set transaction_type = ( select id from transaction_types where name = 'Income' );
      INSERT INTO passbooks(account_id, activity_id, previous_balance, transaction_type_id, balance, created_at, updated_at)
      VALUES(NEW.to_account_id, NEW.id, old_balance, transaction_type, old_balance + NEW.amount, now(), now());
      update accounts set amount = old_balance + NEW.amount, updated_at = now() where id = NEW.to_account_id;
    END IF;
  END IF;

  IF (OLD.from_account_id <=> NEW.from_account_id) AND
    (OLD.to_account_id <=> NEW.to_account_id) AND
    NOT (OLD.amount <=> NEW.amount) THEN
    IF OLD.from_account_id IS NOT NULL THEN
      update passbooks set balance = balance + OLD.amount - NEW.amount, updated_at = now()
      where activity_id = OLD.id and account_id = OLD.from_account_id;

      update accounts a set amount = amount + OLD.amount - NEW.amount, updated_at = now() where id = OLD.from_account_id;
    END IF;

    IF OLD.to_account_id IS NOT NULL THEN
      update passbooks set balance = balance - OLD.amount + NEW.amount, updated_at = now()
      where activity_id = OLD.id and account_id = OLD.to_account_id;

      update accounts a set amount = amount - OLD.amount + NEW.amount, updated_at = now() where id = OLD.to_account_id;
    END IF;
  END IF;
END