import { component$, useClientEffect$, useStore } from "@builder.io/qwik";

export const NxtImages = component$(() => {

	const gudang = useStore({
			gam: Array(),
	});

	useClientEffect$(() => {
			for (let i = 1; i < 3; i++) {
					gudang.gam.push("localhost:8080/images/" + i + ".jpg");
			}
			console.log(gudang.gam);
	});

	return (
			<>
					<div>
							{gudang.gam.length > 0 && gudang.gam.map((image) => (
									console.log('inside the map',  gudang.gam),
									(<img src={image} loading='lazy' />)
							))}
					</div>
			</>
	);
});