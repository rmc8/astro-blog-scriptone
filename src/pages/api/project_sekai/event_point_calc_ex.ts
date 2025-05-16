import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const basicPoint = url.searchParams.get("b");
    const point = url.searchParams.get("p");
    const pValue = point != null ? Math.max(100, parseInt(point, 10)) : null;
    const apiUrl = `https://raw.githubusercontent.com/rmc8/prsk_event_point_calc/main/api/point_data_bp${basicPoint}.json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("APIリクエストに失敗しました");
        }
        const data = await response.json();

        // pValueに基づいてデータを処理
        let result = [];
        if (pValue !== null) {
            const key = pValue.toString();
            if (key in data) {
                result = data[key];
            }
        }

        return new Response(JSON.stringify({ data: result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        if (
            err instanceof Error &&
            err.message === "APIリクエストに失敗しました"
        ) {
            return new Response(
                JSON.stringify({ error: "APIリクエストに失敗しました" }),
                {
                    status: 502,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        return new Response(
            JSON.stringify({ error: "サーバーエラーが発生しました" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};

export const prerender = false;
