var categories=[
'Automotive',
'Business & Productivity',
'eCommerce',
'Education',
'Fashion',
'Financial Services',
'Games',
'Health & Fitness',
'Home & Garden',
'Movies, TV, and Entertainment',
'New',
'Social',
'Sports',
'Travel'
];

for(var i=0;i<categories.length;i++){

	var line = categories[i];
	
	console.log("INSERT INTO `ymdsp`.`dsp_app_category`(`category_name`,`created_time`,`created_by`,`updated_time`,`updated_by`,`is_valid`)VALUES('"+line+"',now(),1,now(),1);");

}


