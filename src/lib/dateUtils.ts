/**
 * 日付をYYYY-MM-DD形式にフォーマットする
 */
export function formatDateISO(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 日付をYYYY年M月D日形式にフォーマットする
 */
export function formatDateJapanese(date: Date): string {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}