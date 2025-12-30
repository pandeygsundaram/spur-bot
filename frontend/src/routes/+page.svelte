<script lang="ts">
  import ChatWidget from '$lib/components/ChatWidget.svelte';
</script>

<svelte:head>
  <title>Spur Store - Customer Support</title>
</svelte:head>

<main>
  <ChatWidget />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    background: #0a0a0a;
    min-height: 100vh;
    color: white;
  }

  main {
    padding: 40px 20px;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at top, rgba(253, 184, 19, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at bottom, rgba(20, 20, 20, 0.9) 0%, #0a0a0a 100%);
    position: relative;
  }

  main::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(253, 184, 19, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(253, 184, 19, 0.02) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    main {
      padding: 0;
    }
  }
</style>
