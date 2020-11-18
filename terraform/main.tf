terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "3.47.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "3.47.0"
    }
  }
  backend "gcs" {
    prefix = "nais-mkdocs"
    bucket = "terraform-prod-235011"
  }
}

provider "google-beta" {
  project = "aura-prod-d7e3"
}

provider "google" {
  project = "aura-prod-d7e3"
}

resource "google_storage_bucket" "nais-mkdocs-html" {
  name          = "doc.nais.io"
  location      = "EU"
  force_destroy = true

  uniform_bucket_level_access = true
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# Reserve an external IP
resource "google_compute_global_address" "website" {
  provider = google
  name     = "doc-nais-io-ip"
}

# Add the bucket as a CDN backend
resource "google_compute_backend_bucket" "website" {
  provider    = google
  name        = "doc-nais-io-backend"
  description = "Contains files needed by the website"
  bucket_name = google_storage_bucket.nais-mkdocs-html.name
  enable_cdn  = true
}

# Create HTTPS certificate
resource "google_compute_managed_ssl_certificate" "website" {
  provider = google-beta
  name     = "doc-nais-io"

  managed {
    domains = ["doc.nais.io."]
  }

  # See README.md's 'Things went wrong when we attempted to edit FQDN'
  lifecycle {
    create_before_destroy = true
  }
}

# GCP URL MAP
resource "google_compute_url_map" "website" {
  provider        = google
  name            = "doc-nais-io-url-map"
  default_service = google_compute_backend_bucket.website.self_link
}

# GCP target proxy
resource "google_compute_target_https_proxy" "website" {
  provider         = google
  name             = "doc-nais-io"
  url_map          = google_compute_url_map.website.self_link
  ssl_certificates = [google_compute_managed_ssl_certificate.website.self_link]
}

# GCP forwarding rule
resource "google_compute_global_forwarding_rule" "default" {
  provider              = google
  name                  = "doc-nais-io-forwarding-rule"
  load_balancing_scheme = "EXTERNAL"
  ip_address            = google_compute_global_address.website.address
  ip_protocol           = "TCP"
  port_range            = "443"
  target                = google_compute_target_https_proxy.website.self_link
}

resource "google_storage_bucket_iam_member" "nais-team" {
  bucket = google_storage_bucket.nais-mkdocs-html.name
  role   = "roles/storage.admin"
  member = "group:grp-gcp-admin@nav.no"
}

resource "google_storage_bucket_iam_member" "member" {
  bucket = google_storage_bucket.nais-mkdocs-html.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_compute_url_map" "http-https_redirect" {
  name        = "doc-nais-io-http-to-https"
  description = "http to https redirector"
  default_url_redirect {
    strip_query            = false
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
  }
}

resource "google_compute_target_http_proxy" "http-https_redirect" {
  provider = google-beta
  name     = "doc-nais-io-http-to-https"
  url_map  = google_compute_url_map.http-https_redirect.id
}

resource "google_compute_global_forwarding_rule" "http-https_redirect" {
  provider = google-beta
  name     = "doc-nais-io-http-to-https"

  ip_address  = google_compute_global_address.website.address
  ip_protocol = "TCP"
  port_range  = "80"
  target      = google_compute_target_http_proxy.http-https_redirect.id
}
