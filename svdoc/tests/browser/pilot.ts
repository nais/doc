import { mount } from "svelte";
import Pilot from "./Pilot.svelte";

const target = document.getElementById("app");
if (!target) throw new Error("Missing pilot mount target");
mount(Pilot, { target });
