<?php
/**
 * Plugin Name: Aether AI
 * Plugin URI: https://aether.ai
 * Description: Connects your WordPress site to Aether AI Agentic Chatbot.
 * Version: 1.0.0
 * Author: Aether AI
 */

if (!defined('ABSPATH')) {
    exit;
}

// Add Admin Menu
add_action('admin_menu', 'aether_ai_admin_menu');
function aether_ai_admin_menu() {
    add_menu_page('Aether AI', 'Aether AI', 'manage_options', 'aether_ai', 'aether_ai_settings_page', 'dashicons-format-chat', 100);
}

// Register Settings
add_action('admin_init', 'aether_ai_settings_init');
function aether_ai_settings_init() {
    register_setting('aether_ai_settings', 'aether_ai_bot_slug');
}

// Settings Page HTML
function aether_ai_settings_page() {
    ?>
    <div class="wrap">
        <h1>Aether AI Configuration</h1>
        <form method="post" action="options.php">
            <?php settings_fields('aether_ai_settings'); ?>
            <?php do_settings_sections('aether_ai_settings'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Bot Slug (from Aether Dashboard)</th>
                    <td><input type="text" name="aether_ai_bot_slug" value="<?php echo esc_attr(get_option('aether_ai_bot_slug')); ?>" class="regular-text" placeholder="e.g. imran-ai" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <hr>
        <p>Once saved, the Aether AI Agent will automatically appear on all frontend pages.</p>
        <a href="https://app.aether.ai/admin" target="_blank" class="button button-secondary">SSO Jump to Aether Dashboard</a>
    </div>
    <?php
}

// Inject Script into Frontend
add_action('wp_footer', 'aether_ai_inject_script');
function aether_ai_inject_script() {
    $slug = get_option('aether_ai_bot_slug');
    if (!empty($slug)) {
        echo '<script src="http://localhost:4022/embed.js" data-bot="' . esc_attr($slug) . '" defer></script>';
    }
}
