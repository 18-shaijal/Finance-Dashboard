import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

export default function KeyboardShortcutsDialog({
  open,
  onClose,
  showAdminShortcuts,
}: {
  open: boolean;
  onClose: () => void;
  showAdminShortcuts: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth scroll="paper">
      <DialogTitle>Keyboard shortcuts</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Esc or click away to close.
        </Typography>
        <List dense disablePadding>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="/" secondary="Focus transaction search" />
          </ListItem>
          {showAdminShortcuts && (
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="A" secondary="Open Add transaction (Admin)" />
            </ListItem>
          )}
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="?" secondary="This panel" />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}
