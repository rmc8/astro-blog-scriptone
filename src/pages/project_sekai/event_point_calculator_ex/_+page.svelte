<script lang="ts">
    import { onMount } from "svelte";

    const BasicPointListUrl =
        "https://script.googleusercontent.com/macros/echo?user_content_key=r2RHRdb_zKobsdItfpCL0oiBtM1Rh9sHBH_yMvHp0bGiRXxvnJ6kW6hWODGE1Wmeqrl1ytkBIladkawW9x03RC0ZgRovhmJSm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnB-wvnq4W2geyVj9oP_ArqZXVkcbLOyUGVArs1Q5E13KZX1Cgu4LSIXpbND39xTly20l9nxmWxJ0jzePsjXwPGxnU4rPc6hCWtz9Jw9Md8uu&lib=MDcqUnbhmNfuNY01FFcw_nRyop-5UCkVO";
    type bpData = {
        id: Number;
        name: String;
        basic_point: Number;
    };
    type bpRes = {
        data: bpData[];
    };
    // 楽曲選択
    let selectedSong: bpData | null = $state(null);
    let basicPoint: Number = $state(100);
    let basicPointList: bpRes = $state({ data: [] });
    let isLoading = $state(true);
    let searchTerm = $state("");
    let filteredSongs: bpData[] = $state([]);
    let currentPage = $state(1);
    let itemsPerPage = 10;
    let maxPageButtons = 7;

    // 計算
    let inputNumber: number | null = $state(null);
    let calculationResult: any = $state(null);
    let errorMessage = $state("");
    let calc = $state(false);
    let calcCurrentPage = $state(1);
    let calcItemsPerPage = 8;

    // 楽曲選択ロジック
    function handleSearch(event: Event) {
        currentPage = 1;
        searchTerm = (event.target as HTMLInputElement).value;
    }

    function handleSongSelection(song: bpData) {
        calculationResult = null;
        selectedSong = song;
        basicPoint = song.basic_point;
    }

    function getVisiblePages(current: number, total: number, max: number) {
        if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

        let start = Math.max(current - Math.floor(max / 2), 1);
        let end = Math.min(start + max - 1, total);

        if (end - start + 1 < max) {
            start = Math.max(end - max + 1, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    function changePage(newPage: number) {
        currentPage = newPage;
    }

    onMount(async () => {
        console.log("onMount function started"); // Added for debugging
        try {
            const response = await fetch(BasicPointListUrl);
            if (!response.ok) {
                throw new Error("データの取得に失敗しました");
            }
            basicPointList = await response.json();
        } catch (error) {
            console.error("エラー:", error);
            // エラー処理を追加することができます
        } finally {
            isLoading = false;
        }
    });
    // イベントポイントの取得ロジック

    async function calculateEventPoints() {
        try {
            calc = true;
            if (
                typeof basicPoint !== "number" ||
                typeof inputNumber !== "number"
            ) {
                errorMessage =
                    "基礎点とイベントポイントは数値で入力してください。";
                return;
            }

            errorMessage = "";
            const url = `https://rmc-8.com/api/project_sekai/event_point_calc_ex?b=${basicPoint}&p=${inputNumber}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("APIリクエストに失敗しました");
                }
                calculationResult = await response.json();
                calcCurrentPage = 1;
            } catch (error) {
                console.error("エラー:", error);
                errorMessage = "データの取得に失敗しました。";
            }
        } finally {
            calc = false;
        }
    }

    $effect(() => {
        if (basicPointList && basicPointList.data) {
            filteredSongs = basicPointList.data.filter(
                (song) =>
                    String(song.name)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    song.basic_point.toString().includes(searchTerm)
            );
        }
    });
    let totalPages = $derived(Math.ceil(filteredSongs.length / itemsPerPage));
    let paginatedSongs = $derived(
        filteredSongs.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    );
    let visiblePages = $derived(
        getVisiblePages(currentPage, totalPages, maxPageButtons)
    );
    let calcPaginatedResults = $derived(
        calculationResult && calculationResult.data
            ? calculationResult.data.slice(
                  (calcCurrentPage - 1) * calcItemsPerPage,
                  calcCurrentPage * calcItemsPerPage
              )
            : []
    );
    let calcTotalPages = $derived(
        calculationResult && calculationResult.data
            ? Math.ceil(calculationResult.data.length / calcItemsPerPage)
            : 0
    );
</script>

<main class="py-8">
    <article class="max-w-4xl mx-auto rounded-lg overflow-hidden">
        <div class="container p-6">
            <h2 class="text-3xl font-bold mb-4">
                【試験運用】Event Point Calculator (EX)
            </h2>
            <p class="mb-6">
                (2024-09-11)<br />
                お試しで公開をはじめました。本日時点で全460曲分の対応となっています。各基礎点ごとの点数の検証などを進めている段階ですので、最終的なポイント調整には独りんぼエンヴィーの0炊きでお願いいたします。また、不具合がありましたら、X/Discord/Blueskyなどにご連絡ください。
            </p>
            <p class=" mb-6">
                任意の楽曲でのイベントポイントの調整のための計算をします。調整に使う楽曲を選択したあと、獲得したいポイントを入力して計算ボタンを押してください。炊きありの場合には小数点の切り捨ての関係で誤差が出る場合がありますため、最終的な調整は0炊きでお願いいたします。
            </p>
            <div class="calculator">
                <div class="form">
                    {#if isLoading}
                        <p class="">楽曲データを読み込んでいます...</p>
                    {:else}
                        <h3>楽曲選択</h3>
                        <div class="mb-4">
                            <label
                                for="song-search"
                                class="block text-sm font-medium mb-1"
                                >楽曲名または基礎点で検索：</label
                            >
                            <input
                                type="text"
                                id="song-search"
                                bind:value={searchTerm}
                                oninput={handleSearch}
                                placeholder="楽曲名または基礎点"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {#if totalPages > 1}
                            <div class="pagination flex pace-x-2">
                                {#if currentPage > 1}
                                    <button
                                        onclick={() =>
                                            changePage(currentPage - 1)}
                                        class="pagination-btn">＜</button
                                    >
                                {/if}
                                {#each visiblePages as page}
                                    <button
                                        onclick={() => changePage(page)}
                                        class="pagination-btn"
                                        class:active={currentPage === page}
                                    >
                                        {page}
                                    </button>
                                {/each}
                                {#if currentPage < totalPages}
                                    <button
                                        onclick={() =>
                                            changePage(currentPage + 1)}
                                        class="pagination-btn">＞</button
                                    >
                                {/if}
                            </div>
                        {/if}
                        <div class="overflow-x-auto">
                            <table>
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th>楽曲名</th>
                                        <th>基礎点</th>
                                        <th>選択</th>
                                    </tr>
                                </thead>
                                <tbody
                                    class="bg-white divide-y divide-gray-200"
                                >
                                    {#each paginatedSongs as song}
                                        <tr>
                                            <td>{song.name}</td>
                                            <td style="text-align:right"
                                                >{song.basic_point}</td
                                            >
                                            <td>
                                                <button
                                                    onclick={() =>
                                                        handleSongSelection(
                                                            song
                                                        )}
                                                    class="select">選択</button
                                                >
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                        {#if selectedSong}
                            <div class="mt-8 p-4 calc-form rounded-lg">
                                <h3>イベントポイント計算</h3>
                                <p class="">
                                    選択した楽曲: <span class="font-medium"
                                        >{selectedSong.name}</span
                                    >
                                </p>
                                <p class=" mb-4">
                                    基礎点: <span class="font-medium"
                                        >{basicPoint}</span
                                    >
                                </p>
                                <div>
                                    <p class=" mb-2">
                                        獲得したいイベントポイントを数値で入力してください。
                                    </p>
                                    <div class="flex items-center">
                                        <input
                                            class="event_point_input mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            type="number"
                                            bind:value={inputNumber}
                                            placeholder="Input number"
                                        />
                                        <button
                                            onclick={calculateEventPoints}
                                            class="calculate px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >計算</button
                                        >
                                    </div>
                                </div>
                            </div>
                        {/if}

                        {#if calculationResult}
                            <div class="result mt-8">
                                {#if errorMessage !== ""}
                                    <p
                                        class="error pt-8 text-red-600 font-semibold"
                                    >
                                        {errorMessage}
                                    </p>
                                {:else if calc}
                                    <p class="pt-8">計算中です...</p>
                                {:else if calculationResult.data.length === 0}
                                    <p class="pt-8">データがありません。</p>
                                {:else}
                                    {#if calcTotalPages > 1}
                                        <div class="pagination">
                                            {#if calcCurrentPage > 1}
                                                <button
                                                    onclick={() =>
                                                        calcCurrentPage--}
                                                    class="pagination-btn"
                                                    >＜</button
                                                >
                                            {/if}
                                            {#each Array(calcTotalPages) as _, i}
                                                <button
                                                    onclick={() =>
                                                        (calcCurrentPage =
                                                            i + 1)}
                                                    class="pagination-btn"
                                                    class:active={calcCurrentPage ===
                                                        i + 1}
                                                >
                                                    {i + 1}
                                                </button>
                                            {/each}
                                            {#if calcCurrentPage < calcTotalPages}
                                                <button
                                                    onclick={() =>
                                                        calcCurrentPage++}
                                                    class="pagination-btn"
                                                    >＞</button
                                                >
                                            {/if}
                                        </div>
                                    {/if}
                                    <div class="overflow-x-auto">
                                        <table class="shj">
                                            <thead class="bg-gray-50">
                                                <tr>
                                                    <th>イベントボーナス</th>
                                                    <th>炊き数</th>
                                                    <th>スコア下限</th>
                                                    <th>スコア上限</th>
                                                </tr>
                                            </thead>
                                            <tbody
                                                class="bg-white divide-y divide-gray-200"
                                            >
                                                {#each calcPaginatedResults as data}
                                                    <tr>
                                                        <td class="text-right"
                                                            >{data[0]}</td
                                                        >
                                                        <td class="text-center"
                                                            >{data[1]}</td
                                                        >
                                                        <td class="text-right"
                                                            >{data[2]}</td
                                                        >
                                                        <td class="text-right"
                                                            >{data[3]}</td
                                                        >
                                                    </tr>
                                                {/each}
                                            </tbody>
                                        </table>
                                    </div>
                                {/if}
                            </div>
                        {:else if calc}
                            <p class="pt-8">計算中です...</p>
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
    </article>
</main>

<style is:global>
    #song-search {
        background-color: white;
    }

    .event_point_input {
        width: 160px;
        font-size: 20px;
        padding: 8px;
        margin-top: 24px;
        margin-bottom: 24px;
        background-color: white;
    }

    table {
        max-width: 440px;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 8px;
        overflow: hidden;
    }

    table th,
    table td {
        padding: 8px;
    }

    table th {
        background-color: var(--accent1);
        color: white;
    }

    table tr:last-child td:first-child {
        border-bottom-left-radius: 8px;
    }

    tr {
        background-color: var(--bg2);
    }

    table tr:last-child td:last-child {
        border-bottom-right-radius: 8px;
    }
    .error {
        color: #822;
        font-weight: bold;
    }

    .select {
        background-color: var(--accent1);
        font-size: 0.8em;
        color: white;
        padding: 0.2em;
        border-radius: 4px;
    }

    .pagination button {
        border: 0px;
        background-color: var(--accent1);
        color: white;
        font-weight: bold;
        width: 32px;
        height: 32px;
        margin-right: 8px;
        border-radius: 50%;
    }

    .pagination button:hover,
    .pagination button:active {
        background-color: var(--accent4);
    }

    :global(button.active) {
        background-color: var(--accent4) !important;
    }

    .calculate {
        background-color: var(--accent1);
        color: white;
        padding: 0.5em;
        border-radius: 4px;
        margin-left: 4px;
    }

    .pagination {
        padding-bottom: 24px;
    }

    .calc-form {
        background-color: var(--bg2);
        color: #2f3017;
        border-color: var(--border1);
    }
</style>
