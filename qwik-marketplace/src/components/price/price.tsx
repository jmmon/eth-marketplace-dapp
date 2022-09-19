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
			state.output = String(+props.price / ETH_CONVERSION_RATIOS[state.units]);

			console.log({units: state.units, val: state.output});
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
