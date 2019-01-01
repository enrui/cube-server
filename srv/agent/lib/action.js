Gpio = require('onoff').Gpio;
power = new Gpio(2, 'out');
led-front-left = new Gpio(3, 'out');
led-front-right = new Gpio(4, 'out');

power.writeSync(0);
led-front-left.writeSync(0);
led-front-right.writeSync(0);


module.exports = {
	
	go : function() {
		power.writeSync(0);
	},
	
	stop : function() {
		power.writeSync(1);
	},
	light-on : function() {
		led-front-left.writeSync(1);
		led-front-right.writeSync(1);
        },
	light-off : function() {
                led-front-left.writeSync(0);
		led-front-right.writeSync(0);
        }
	
};

