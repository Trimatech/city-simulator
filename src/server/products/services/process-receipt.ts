import { MarketplaceService, Players } from "@rbxts/services";

type ProductHandler = (player: Player) => void;

const productHandlers = new Map<number, ProductHandler>();

export async function initProcessReceiptService() {
	print(`[ProcessReceipt] Initializing. Registered product IDs: ${productHandlers.size()}`);
	for (const [id] of productHandlers) {
		print(`[ProcessReceipt]   Registered product ID: ${id}`);
	}

	MarketplaceService.ProcessReceipt = (receipt) => {
		print(
			`[ProcessReceipt] Received receipt: ProductId=${receipt.ProductId}, PlayerId=${receipt.PlayerId}, PurchaseId=${receipt.PurchaseId}`,
		);

		const player = Players.GetPlayerByUserId(receipt.PlayerId);
		if (!player) {
			warn("[ProcessReceipt] Player not found for UserId", { playerId: receipt.PlayerId });
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		const handler = productHandlers.get(receipt.ProductId);
		if (!handler) {
			warn("[ProcessReceipt] No handler for ProductId", {
				productId: receipt.ProductId,
				registeredCount: productHandlers.size(),
			});
			for (const [id] of productHandlers) {
				warn("[ProcessReceipt] Have handler for", { id });
			}
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		print(`[ProcessReceipt] Found handler for ProductId ${receipt.ProductId}, executing...`);
		const [success, message] = pcall(handler, player);

		if (!success) {
			warn("[ProcessReceipt] Handler failed for ProductId", { productId: receipt.ProductId, message });
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		print(`[ProcessReceipt] Purchase granted for ProductId ${receipt.ProductId}, player ${player.Name}`);
		return Enum.ProductPurchaseDecision.PurchaseGranted;
	};
}

export function createProduct(id: number, handler: ProductHandler) {
	print(`[ProcessReceipt] Registering product handler for ID: ${id}`);
	productHandlers.set(id, handler);
}
