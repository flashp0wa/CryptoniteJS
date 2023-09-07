select * from cry_bollinger_bands order by eventTime desc

declare 
	@testOut1 as decimal(19,8)
	,@testOut2 as decimal(19,8)
	,@testOut3 as decimal(19,8)
	--,@testOut4 as decimal(19,8)
	--,@testOut5 as decimal(19,8)
	--,@testOut6 as decimal(19,8)
	--,@testOut7 as decimal(19,8)


exec StochasticOscillator
	@symbolId = 3
	,@timeFrameId = 3
	,@stoFastOut = @testOut1 output
	,@stoFastSmoothOut = @testOut2 output
	,@stoSlowSmoothOut = @testOut3 output
	--,@sma50Out = @testOut4 output
	--,@sma100Out = @testOut5 output
	--,@sma200Out = @testOut6 output

select @testOut1, @testOut2, @testOut3

delete from cry_stochastic_oscillator
where eventTime > '2023-04-29 23:59:59'
--delete from cry_moving_average_convergence_divergence where eventTime > '2023-04-28 23:59:59'


exec StochasticOscillator


select * from cry_stochastic_oscillator order by eventTime desc