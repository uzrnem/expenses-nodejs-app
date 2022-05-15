SELECT
 tag.name, sub.name, group_concat(DISTINCT(lower(remarks)))
FROM `activities` as act
LEFT JOIN `tags` tag ON `tag`.`id` = `act`.`tag_id`
LEFT JOIN `tags` sub ON `sub`.`id` = `act`.`sub_tag_id`
-- WHERE sub_tag_id is not null and `act`.`transaction_type_id` = 2
GROUP BY act.tag_id, act.sub_tag_id, lower(remarks)
order by tag.name, sub.name;

SELECT
 tag.name as tag, sub.name as sub, group_concat(DISTINCT(lower(remarks))) as comment
FROM `activities` as act
LEFT JOIN `tags` tag ON `tag`.`id` = `act`.`tag_id`
LEFT JOIN `tags` sub ON `sub`.`id` = `act`.`sub_tag_id`
GROUP BY act.tag_id, act.sub_tag_id, lower(remarks)
order by tag.name, sub.name limit 1000;

SELECT tag.name, sub.name, count(act.id)
FROM `tags` tag
LEFT JOIN `activities` act ON `tag`.`id` = `act`.`tag_id`
LEFT JOIN `tags` sub ON `sub`.`id` = `act`.`sub_tag_id`
where tag.tag_id is null
GROUP BY act.tag_id, tag.name, act.sub_tag_id
order by tag.name, sub.name;

--Advance Passbook
SELECT year,mon, yrmon,
    SUM(CASE WHEN type = "Saving" THEN amount ELSE 0 END) "Saving",
    SUM(CASE WHEN type = "Credit" THEN amount ELSE 0 END) "Credit",
    SUM(CASE WHEN type = "Wallet" THEN amount ELSE 0 END) "Wallet",
    SUM(CASE WHEN type = "Mutual Funds" THEN amount ELSE 0 END) "Mutual Funds",
    SUM(CASE WHEN type = "Stocks Equity" THEN amount ELSE 0 END) "Stocks Equity",
    SUM(CASE WHEN type = "Deposit" THEN amount ELSE 0 END) "Deposit",
    SUM(CASE WHEN 1 THEN amount ELSE 0 END) "Total"
FROM (
    SELECT c.id, c.account_name, c.type, t.year, t.mon, (
            SELECT p.balance
            FROM passbooks p
            LEFT JOIN activities a ON a.id = p.activity_id
            WHERE p.account_id = c.id and EXTRACT(YEAR_MONTH FROM a.event_date) <= t.yrmon
            ORDER BY a.event_date DESC
            LIMIT 1
        ) as amount, t.yrmon
    FROM (
        SELECT YEAR(event_date) AS year, MONTHNAME(event_date) AS mon,
            EXTRACT(YEAR_MONTH FROM event_date) AS yrmon
        FROM activities
        WHERE event_date > DATE_SUB(NOW(), INTERVAL 1 YEAR)
        GROUP BY EXTRACT(YEAR_MONTH FROM event_date), YEAR(event_date), MONTHNAME(event_date)
    ) t
    LEFT JOIN (
        SELECT
            a.id, a.name AS account_name, t.name AS type
        FROM accounts a
        LEFT JOIN account_types t ON a.account_type_id = t.id
        WHERE NOT a.is_closed AND NOT a.is_snapshot_disable
    ) c ON 1
) AS passbook
GROUP BY year,mon, yrmon;

update activities set tag_id = 24, sub_tag_id = tag_id where tag_id in (33, 31, 35, 36, 40)

SELECT
  a.tag_id, a.sub_tag_id, a.remarks
FROM activities a
left join tags t on t.id = a.tag_id
where t.tag_id is not null;

SELECT
  a.tag_id, a.sub_tag_id, a.remarks
FROM activities a
left join tags t on t.id = a.sub_tag_id
where a.sub_tag_id is not null and t.tag_id is null;

SELECT
a.*
FROM activities a
left join tags t on t.id = a.sub_tag_id
where a.sub_tag_id is not null and a.tag_id != t.tag_id;


--Credit cards 
SELECT year,mon, yrmon,
    SUM(CASE WHEN name = 'TOTAL' THEN amount ELSE 0 END) 'TOTAL',
    SUM(CASE WHEN name = 'HDFC CC' THEN amount ELSE 0 END) 'HDFC CC',
    SUM(CASE WHEN name = 'Yes Bank CC' THEN amount ELSE 0 END) 'Yes Bank CC',
    SUM(CASE WHEN name = 'SBI CC' THEN amount ELSE 0 END) 'SBI CC',
    SUM(CASE WHEN name = 'ICICI Amazon Pay CC' THEN amount ELSE 0 END) 'ICICI'
FROM (
    SELECT
        IFNULL(ac.name, 'TOTAL') AS name, sum(a.amount) AS amount,
        EXTRACT(YEAR_MONTH FROM a.event_date) AS yrmon, YEAR(a.event_date) AS year, MONTHNAME(a.event_date) AS mon
    FROM `activities` a
    LEFT JOIN accounts ac ON a.to_account_id = ac.id
    WHERE (SELECT id FROM `tags` WHERE name = 'Credit Card Bill') IN (a.tag_id, a.sub_tag_id) OR a.transaction_type_id in (SELECT id FROM `transaction_types` WHERE name = 'Expense')
    GROUP BY a.to_account_id, EXTRACT(YEAR_MONTH FROM a.event_date), YEAR(a.event_date), MONTHNAME(a.event_date)
) AS passbook
GROUP BY year,mon, yrmon;