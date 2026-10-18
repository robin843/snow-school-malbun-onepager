/**
 * Presentation only: which YETI Core tariff rows a course card shows before
 * the visitor expands the list. Prices and row content always come from Core.
 */
export const VISIBLE_TARIFFS = 3;

/** 1–3 tariffs are shown fully and need no control; 4+ start collapsed. */
export const tariffToggleVisible = (total: number): boolean => total > VISIBLE_TARIFFS;

/** Rows rendered for the current state; expansion never adds or hides a tariff. */
export const visibleTariffCount = (total: number, expanded: boolean): number =>
  expanded ? total : Math.min(total, VISIBLE_TARIFFS);

/**
 * Private cards show the Core-derived 60/120-minute summary first; the long
 * 3h–7h/person "Weitere Dauertarife" list stays fully collapsed until expanded.
 */
export const privateFurtherTariffCount = (total: number, expanded: boolean): number =>
  expanded ? total : 0;
