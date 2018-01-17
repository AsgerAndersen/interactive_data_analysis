$(function() {

	var board_config = {
	  	threshold_slider: {
	  		output_id: "#threshold_value",
	  		min: -100,
	  		max: -25,
	  		step: 1,
	  		range_slider: false,
	  		value: graph_seq_params.threshold,
	  		format_output: function(threshold) {return String(threshold) + " dBm"}
	  	},
	  	binsize_slider: {
	  		output_id: "#binsize_value",
	  		min: 5,
	  		max: 60*4,
	  		step: 5,
	  		range_slider: false,
	  		value: graph_seq_params.bin_size / 60,
	  		format_output: function(binsize) {
					if (binsize<60) {
			        s = String(binsize) + " minutes"
			    }
			    else {
			        h = Math.floor(binsize / 60)
			        m = binsize % 60
			        if (m < 10) {
			            m = "0"+String(m)
			        }
			        else {
			            m = String(m)
			        }
			        s = String(h) + ":" + m + " hours"
			    }
			return s 
			}
	  	},
	  	start_end_slider: {
	  		output_ids: ["#start_value", "#end_value"],
	  		min: 0,
	  		max: 24*5 - 2,
	  		step: 1,
	  		range_slider: true,
	  		value: [graph_seq_params.start_time / 3600, graph_seq_params.end_time / 3600],
	  		format_output: function(hours) {
	  			day = Math.floor(hours / 24) + 1
	  			hour = hours % 24
	  			if (hour < 10) {hour = "0"+String(hour)}
	  			s = String(hour) + ":00, Day " + String(day)
	  			return s 
	  		}
	  	}
	}

    $( ".slider" ).each(function() {

      config = board_config[this.id]
      
		if (config.range_slider) {

	      	var output_div_1 = $(config.output_ids[0]),
	      		output_div_2 = $(config.output_ids[1])

	      	function createFunc() {
	      		var value_1 = $(this).slider("values")[0],
	      			value_2 = $(this).slider("values")[1]

	      		value_1 = board_config[this.id].format_output(value_1)
	      		value_2 = board_config[this.id].format_output(value_2)
	      		output_div_1.text(value_1)
	      		output_div_2.text(value_2)
	      	}

	      	function slideFunc(event, ui) {
	      		var value_1 = ui.values[0],
	      			value_2 = ui.values[1]

	      		value_1 = board_config[this.id].format_output(value_1)
	      		value_2 = board_config[this.id].format_output(value_2)

	      		output_div_1.text( value_1 )
	      		output_div_2.text( value_2 )
	      	}
	      }
	      else {
	      	
	      	var output_div = $(config.output_id)

	      	function createFunc() {
	      		var value = $(this).slider("value")
	   			
	      		value = board_config[this.id].format_output(value)
	      		
	      		output_div.text(value)
	      	}

	      	function slideFunc(event, ui) {
	      		var value = ui.value 

	      		value = board_config[this.id].format_output(value)

	      		output_div.text( value )
	      	}

	      }
      
      	$( this ).slider({
			min: config.min,
			max: config.max,
			step: config.step,
			range: config.range_slider,
			value: config.value,
			values: config.value,
			create: createFunc,
			slide: slideFunc,
			change: updatePars
    	});
	});

	$('.checkbox').checkboxradio({
		icon: false
	})
});