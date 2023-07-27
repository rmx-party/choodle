/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import {registerRoute} from 'workbox-routing';
import {StaleWhileRevalidate} from 'workbox-strategies';
import {cleanupOutdatedCaches} from "workbox-precaching";

registerRoute(
    ({url}) => true,
    new StaleWhileRevalidate()
);

cleanupOutdatedCaches()
