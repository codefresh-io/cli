class Codefresh < Formula
    desc "Codefresh CLI provides a full and flexible interface to interact with Codefresh."
    homepage "http://cli.codefresh.io"
    url "https://github.com/codefresh-io/cli/releases/download/{{ VERSION }}/codefresh-{{ VERSION }}-macos-x64.tar.gz"
    version "{{ VERSION }}"
    sha256 "{{ SHA256 }}"
  
    def install
      bin.install "codefresh"
    end
  
    test do
      system "#{bin}/codefresh version"
    end
  end