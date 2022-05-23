All in one

SELECT
acc.name, t.name, a.amount, a.event_date, a.remarks
FROM `activities` a
left join accounts acc on a.to_account_id = acc.id
left join tags t on a.sub_tag_id = t.id
where a.transaction_type_id in (SELECT id FROM `transaction_types` where name in ('income'))
and a.event_date BETWEEN '2021-04-01' and '2022-03-31'
and a.sub_tag_id in (SELECT id FROM `tags` where name in ('Bank Interest', 'Earn Profit', 'Dividend', 'FD Interest'))
order by a.event_date asc
limit 1000


Stocks
SELECT
 stock_code, description, current_quantity, buy_date, sell_date, days_temp, 
 ((current_quantity*buy_price) + buy_charges) as buy_cost,
 ((current_quantity*final_price) - sell_charges) as sell_cost,
 ((current_quantity*(final_price-buy_price)) - buy_charges- sell_charges) as in_hand, quantity,
 buy_price, buy_charges, final_price, sell_charges, status, parent_id
FROM `accounts` where sell_date BETWEEN '2021-04-01' and '2022-03-31'
order by sell_date ASC limit 1000