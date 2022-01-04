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