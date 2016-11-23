$(document).ready(function(){
	
	//On click of start button, hide start content and show & init canvas
	$('#startBtn').on('click', function() {
		$('#startScreen').css('display', 'none');
		$('#canvas').css('display', 'inline');
		init();
	});

	//Canvas stuff
	var canvas = $("#canvas")[0];
	//Lets save the cell width in a variable for easy control
	var cw = 40;
	//Function to make canvas w/h max while still a multiple of cw
	var lowerToMultiple = function(m, x) {
		var val = x;
		while (val % m != 0) {
			val = val - 1;
		}
		return val;
	}
	//Set canvas width and height
	$("#canvas").attr("width", lowerToMultiple(cw, window.innerWidth));
	$("#canvas").attr("height", lowerToMultiple(cw, window.innerHeight));
	//More canvas stuff and variables
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	var d;
	var food;
	var score;
	var speed;
	var endOnce;

	var colorList = [
						{bgleft: "#13ec62", bgright: "#965841", snek: "#54a251"},
						{bgleft: "#FFF200", bgright: "#CFDBA5", snek: "#009444"},
						{bgleft: "#931e73", bgright: "#f47d90", snek: "#c34d81"},
						{bgleft: "#e19916", bgright: "#dcf846", snek: "#dec82e"},
						{bgleft: "#e94bdb", bgright: "#cec4a6", snek: "#db87c0"},
						{bgleft: "#284312", bgright: "#128160", snek: "#1d6239"},
						{bgleft: "#45eae6", bgright: "#b15e1a", snek: "#7ba480"},
						{bgleft: "#4ed61d", bgright: "#49b5b6", snek: "#4bc569"},
						{bgleft: "#7c36aa", bgright: "#b0d15e", snek: "#968384"},
						{bgleft: "#2ade1f", bgright: "#92ae5b", snek: "#5ec63d"}
						//{bgleft: "#", bgright: "#", snek: "#"},
					];
	var cIndex = 0;
	var currColors = colorList[cIndex];
	function pickNewColor() {
		if (cIndex < colorList.length - 1) {
			cIndex++;
			currColors = colorList[cIndex];
		} else {
			cIndex = 0;
			currColors = colorList[cIndex];
		}
	}
	
	//Lets create the snake now
	var snake_array; //an array of cells to make up the snake
	
	function init()
	{
		endOnce = true;
		speed = 80;
		d = "right"; //default direction
		create_snake();
		create_food(); //Now we can see the food particle
		//finally lets display the score
		score = 0;
		
		//Lets move the snake now using a timer which will trigger the paint function
		//every 60ms
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, speed);
	}
	//init();
	
	function create_snake()
	{
		var length = 5; //Length of the snake
		snake_array = []; //Empty array to start with
		for(var i = length-1; i>=0; i--)
		{
			//This will create a horizontal snake starting from the top left
			snake_array.push({x: i, y:0});
		}
	}
	
	//Lets create the food now
	function create_food()
	{
		food = {
			x: Math.round(Math.random()*(w-cw)/cw), 
			y: Math.round(Math.random()*(h-cw)/cw), 
		};
		//This will create a cell with x/y between 0-44
		//Because there are 45(450/10) positions accross the rows and columns
	}
	
	//Lets paint the snake now
	function paint()
	{
		//To avoid the snake trail we need to paint the BG on every frame
		//Lets paint the canvas now
		ctx.fillStyle = currColors.bgleft;
		ctx.fillRect(0, 0, w/2, h);
		ctx.fillStyle = currColors.bgright;
		ctx.fillRect(w/2, 0, w, h);
		//ctx.strokeStyle = "black"; <---border of canvas
		//ctx.strokeRect(0, 0, w, h);
		
		//The movement code for the snake to come here.
		//The logic is simple
		//Pop out the tail cell and place it infront of the head cell
		var nx = snake_array[0].x;
		var ny = snake_array[0].y;
		//These were the position of the head cell.
		//We will increment it to get the new head position
		//Lets add proper direction based movement now
		if(d == "right") nx++;
		else if(d == "left") nx--;
		else if(d == "up") ny--;
		else if(d == "down") ny++;
		
		//Lets add the game over clauses now
		//This will restart the game if the snake hits the wall
		//Lets add the code for body collision
		//Now if the head of the snake bumps into its body, the game will restart
		if(nx == -1 || nx == w/cw || ny == -1 || ny == h/cw || check_collision(nx, ny, snake_array))
		{
			//restart game
			//init();
			if (endOnce) {
				$('#canvas').css('display', 'none');
				var displayScore = $('<p id="scoreP">Your score: ' + score + '</p>');
				$('#gameOver').append(displayScore);
				$('#endScreen').css('display', 'inline');
			}
			endOnce = false;
			$('#startOverBtn').on('click', function() {
				$('#endScreen').css('display', 'none');
				$('#scoreP').remove();
				$('#canvas').css('display', 'inline');
				init();
			});
			//Lets organize the code a bit now.
			return;
		}
		
		//Lets write the code to make the snake eat the food
		//The logic is simple
		//If the new head position matches with that of the food,
		//Create a new head instead of moving the tail
		if(nx == food.x && ny == food.y)
		{
			var tail = {x: nx, y: ny};
			score++;
			//Speed up game
			goFaster();
			clearInterval(game_loop);
			game_loop = setInterval(paint, speed);
			//Change colors
			//initColors = tempColors;
			pickNewColor();
			//Create new food
			create_food();
		}
		else
		{
			var tail = snake_array.pop(); //pops out the last cell
			tail.x = nx; tail.y = ny;
		}
		//The snake can now eat the food.
		
		snake_array.unshift(tail); //puts back the tail as the first cell
		
		for(var i = 0; i < snake_array.length; i++)
		{
			var c = snake_array[i];
			//Lets paint 10px wide cells
			paint_cell(c.x, c.y);
		}
		
		//Lets paint the food
		paint_cell(food.x, food.y);
		//Lets paint the score
		//var score_text = "Score: " + score;
		//ctx.fillText(score_text, 5, h-5)
	}

	//Lets first create a generic function to paint cells
	function paint_cell(x, y)
	{
		ctx.fillStyle = currColors.snek;
		ctx.fillRect(x*cw, y*cw, cw, cw);
		//ctx.strokeStyle = "white";
		//ctx.strokeRect(x*cw, y*cw, cw, cw);
	}
	
	function check_collision(x, y, array)
	{
		//This function will check if the provided x/y coordinates exist
		//in an array of cells or not
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	}
	
	//Lets add the keyboard controls now
	$(document).keydown(function(e){
		var key = e.which;
		//We will add another clause to prevent reverse gear
		if(key == "37" && d != "right") d = "left";
		else if(key == "38" && d != "down") d = "up";
		else if(key == "39" && d != "left") d = "right";
		else if(key == "40" && d != "up") d = "down";
		//The snake is now keyboard controllable
	})

	function goFaster() {
		speed = speed - 3;
	}
	
})