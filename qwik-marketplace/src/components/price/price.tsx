import {
	$,
	component$,
	useClientEffect$,
	useStore,
	useWatch$,
} from "@builder.io/qwik";
import { convertPriceFromWei, convertPriceToWei } from "~/libs/ethUtils";

interface IPriceState {
	units: string;
	output: string;
}

export const Price = component$(
	(props: {
		price: string; 
		class: string; 
		default?: string
	}) => {
		const state = useStore<IPriceState>({
			units: props.default ?? 'eth',
			output: "",
		});

		const cycleUnits = $(() => {
			state.units =
				state.units === "eth" 
				? "gwei" 
				: state.units === "gwei" 
				? "wei" 
				: "eth";
		});

		useWatch$(({track}) => {
			track(state, "units");
			if (props.price === "") return;

			//re calculate

			// Price component: takes price in wei, and displays converted price based on which units is in state.
			// console.log({propsPrice: props.price, units: state.units});
			const newOutputPrice = convertPriceFromWei(state.units, props.price);
			// console.log('converting price from wei:', {newOutputPrice, units: state.units});

			// take output price and round to 8 decimal places
			const roundedOutputPrice = Math.round(newOutputPrice * Math.pow(10, 8)) / Math.pow(10, 8);

			// next, we need to see if props.price is equal to convertToWei(roundedOutputPrice)
			const weiFromRoundedOutputPrice = convertPriceToWei(state.units, roundedOutputPrice);

			state.output = (props.price !== weiFromRoundedOutputPrice) ? '~'+roundedOutputPrice : roundedOutputPrice;
		});

		return (
			<span
				onClick$={cycleUnits}
				class={`w-full cursor-pointer ${props.class ?? ""}`}
			>
				{state.output} {state.units.toUpperCase()} 
			</span>
		);
	}
);
