import { initCrystalsService } from "./crystals";
import { initMoneyService } from "./money";
import { initProcessReceiptService } from "./process-receipt";

export async function initProductServices() {
	print("[Products] Initializing money service...");
	initMoneyService();
	print("[Products] Initializing crystals service...");
	initCrystalsService();
	print("[Products] Initializing process receipt service...");
	initProcessReceiptService();
	print("[Products] All product services initialized.");
}
