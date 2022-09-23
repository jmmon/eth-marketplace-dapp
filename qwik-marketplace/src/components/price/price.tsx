import {
	$,
	component$,
	useClientEffect$,
	useStore,
	useWatch$,
} from "@builder.io/qwik";
import { ETH_CONVERSION_RATIOS } from "~/libs/ethUtils";

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
			output: " ",
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
			if (props.price === " ") return;

			//re calculate
			const price = String(+props.price / ETH_CONVERSION_RATIOS[state.units]);

			// limit decimal places to 8
			const x = 8;
			state.output = Math.round(price * Math.pow(10,x)) / Math.pow(10,x);

			const weiFromOutput = String(+state.output * ETH_CONVERSION_RATIOS[state.units]);

			// show tilde if output converted to wei is not equal to wei!! to cover all "approximate" cases
			state.output = (weiFromOutput !== props.price && "~") + state.output;
		});

		return (
			<span
				onClick$={cycleUnits}
				class={`cursor-pointer ${props.class ?? ""}`}
			>
				{state.output} {state.units} 
			</span>
		);
	}
);
