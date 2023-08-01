<script lang="ts">
    import {browser} from "$app/environment";

    const newEllipsesFrom = (oldEllipses) => {
        switch (oldEllipses) {
            case '.':
                return '..';
            case '..':
                return '...';
            case '...':
                return '.';
        }
    }

    const updateEllipses = async () => {
        if (!browser) return;
        const ellipses = document.getElementsByClassName("ellipses")[0]
        ellipses.innerHTML = newEllipsesFrom(ellipses.innerHTML)
    }

    setInterval(updateEllipses, 500)
</script>

<span class="ellipses">...</span>