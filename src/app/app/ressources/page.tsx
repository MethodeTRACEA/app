import { redirect } from "next/navigation";

// ===================================================================
// PAGE RETIRÉE — redirection vers /comment-ca-marche.
//
// Cette page expliquait la méthode à l'intérieur de l'application.
// Elle a été retirée de la barre de navigation le 09/07/2026 (commit
// da1e4a2) et ne recevait plus qu'un visiteur sur 30 jours. Les deux
// liens « Comprendre la méthode » de l'accueil et du profil pointent
// désormais vers /comment-ca-marche, qui dit la même chose, en public
// et à jour.
//
// La redirection reste ici pour que les anciens liens et les favoris
// continuent de fonctionner au lieu de tomber sur une page d'erreur.
//
// Redirection temporaire (307), comme /livres : réversible, et sans
// effet de référencement puisque /app/ est interdit aux moteurs dans
// robots.ts.
//
// Le contenu complet de l'ancienne page reste dans l'historique git,
// dernier état au commit d2e54da.
// ===================================================================

export default function RessourcesPage() {
  redirect("/comment-ca-marche");
}
