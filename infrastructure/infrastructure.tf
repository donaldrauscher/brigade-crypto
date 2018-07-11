variable "project" {}

variable "region" {
  default = "us-central1"
}

variable "zone" {
  default = "us-central1-f"
}

provider "google" {
  version = "~> 1.5"
  project = "${var.project}"
  region = "${var.region}"
}

resource "google_container_cluster" "brigade-cluster" {
  name = "brigade-cluster"
  zone = "${var.zone}"
  initial_node_count = "2"
  node_config {
    machine_type = "n1-standard-1"
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }
}
